import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import type {
  MergeOptions,
  SplitOptions,
  CompressOptions,
  ImageToPdfOptions,
  RotateOptions,
  ProcessResult,
  ProcessProgress,
} from '../types';

export type ProgressCallback = (progress: ProcessProgress) => void;

/**
 * Handle errors when loading PDF with pdf-lib, detecting encrypted documents
 */
function handlePdfLibLoadError(err: any, fileName: string): never {
  const msg = err?.message?.toLowerCase() || '';
  if (err?.name === 'EncryptedPDFError' || msg.includes('encrypt') || msg.includes('password')) {
    throw new Error(
      `Dokumen "${fileName}" terproteksi kata sandi (terenkripsi). Demi keamanan dan privasi, silakan buka kunci kata sandi dokumen terlebih dahulu sebelum mengolahnya.`
    );
  }
  throw err;
}

/**
 * Load PDF document with PDF.js and handle password protection
 */
async function loadPdfJsDocument(data: Uint8Array, fileName: string) {
  const loadingTask = pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  try {
    return await loadingTask.promise;
  } catch (err: any) {
    const msg = err?.message?.toLowerCase() || '';
    if (err?.name === 'PasswordException' || msg.includes('password') || msg.includes('encrypt')) {
      throw new Error(
        `Dokumen "${fileName}" memerlukan kata sandi untuk dibuka. Silakan gunakan dokumen tanpa proteksi kata sandi.`
      );
    }
    throw err;
  }
}

/**
 * Safely parses and validates a range string such as "1-3, 5, 7-9" against totalPages.
 * Throws specific, user-friendly Indonesian error messages for any invalid format.
 */
export function parsePageRange(rangeString: string, totalPages: number): number[][] {
  const trimmed = rangeString.trim();
  if (!trimmed) {
    throw new Error('Format rentang halaman tidak boleh kosong. Masukkan format seperti: 1-3, 4-5 atau 1, 2, 3');
  }

  // Check for forbidden characters (only 0-9, comma, hyphen, space allowed)
  if (/[^0-9,\-\s]/.test(trimmed)) {
    throw new Error('Karakter tidak valid ditemukan dalam rentang halaman. Hanya angka, koma (,), dan strip (-) yang diperbolehkan.');
  }

  const rawTokens = trimmed.split(',');
  const groups: number[][] = [];

  for (let idx = 0; idx < rawTokens.length; idx++) {
    const rawToken = rawTokens[idx];
    const token = rawToken.trim();

    if (!token) {
      throw new Error(`Format rentang halaman mengandung tanda koma berlebih atau segmen kosong pada posisi ke-${idx + 1}.`);
    }

    if (token.includes('-')) {
      // Check for double hyphens, e.g. "1--3"
      if (token.includes('--')) {
        throw new Error(`Format tanda strip ganda tidak valid pada rentang: "${token}". Gunakan tepat satu tanda strip (contoh: 1-3).`);
      }

      const parts = token.split('-');
      if (parts.length !== 2) {
        throw new Error(`Format rentang tidak valid: "${token}". Gunakan format rentang dengan dua angka (contoh: 1-3).`);
      }

      const [startStr, endStr] = parts;
      if (!startStr.trim() || !endStr.trim()) {
        throw new Error(`Format rentang tidak lengkap: "${token}". Halaman awal dan akhir harus diisi (contoh: 1-3).`);
      }

      const start = parseInt(startStr.trim(), 10);
      const end = parseInt(endStr.trim(), 10);

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Nomor halaman tidak valid pada rentang: "${token}".`);
      }

      if (start < 1) {
        throw new Error(`Nomor halaman awal tidak boleh kurang dari 1: "${token}".`);
      }

      if (start > end) {
        throw new Error(`Rentang halaman terbalik: "${token}". Halaman awal (${start}) harus lebih kecil atau sama dengan halaman akhir (${end}).`);
      }

      if (end > totalPages) {
        throw new Error(`Halaman akhir (${end}) melebihi total ${totalPages} halaman dokumen pada rentang "${token}".`);
      }

      if (start > totalPages) {
        throw new Error(`Halaman awal (${start}) melebihi total ${totalPages} halaman dokumen pada rentang "${token}".`);
      }

      const pages: number[] = [];
      for (let p = start; p <= end; p++) {
        pages.push(p - 1); // 0-indexed
      }
      groups.push(pages);
    } else {
      const page = parseInt(token, 10);
      if (isNaN(page)) {
        throw new Error(`Nomor halaman tidak valid: "${token}".`);
      }
      if (page < 1) {
        throw new Error(`Nomor halaman tidak boleh kurang dari 1 (ditemukan: ${page}).`);
      }
      if (page > totalPages) {
        throw new Error(`Halaman ${page} melebihi batas. Dokumen hanya memiliki total ${totalPages} halaman.`);
      }
      groups.push([page - 1]); // 0-indexed
    }
  }

  return groups;
}

/**
 * Merge multiple PDF files into one combined PDF
 */
export async function mergePdfs(
  files: File[],
  options: MergeOptions,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  if (files.length < 2) {
    throw new Error('Minimal butuh 2 file PDF untuk digabungkan.');
  }

  onProgress?.({ percentage: 5, statusText: 'Inisialisasi penggabungan PDF...' });

  const mergedPdf = await PDFDocument.create();
  mergedPdf.setCreator('AeroPDF Studio');
  mergedPdf.setProducer('AeroPDF Studio Client Engine');

  if (options.generateToc) {
    const docTitles = files.map((f, i) => `${i + 1}. ${f.name.replace(/\.pdf$/i, '')}`).join(' | ');
    mergedPdf.setTitle(`Merged: ${docTitles}`);
    mergedPdf.setSubject(`Koleksi ${files.length} dokumen gabungan.`);
  }

  const totalFiles = files.length;
  let totalPages = 0;

  for (let i = 0; i < totalFiles; i++) {
    const file = files[i];
    const percent = Math.round(10 + (i / totalFiles) * 75);
    onProgress?.({
      percentage: percent,
      statusText: `Membaca & menggabungkan: ${file.name} (${i + 1}/${totalFiles})`,
      step: i + 1,
      totalSteps: totalFiles,
    });

    const fileBuffer = await file.arrayBuffer();
    let srcPdf: PDFDocument;
    try {
      srcPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
    } catch (err: any) {
      handlePdfLibLoadError(err, file.name);
    }

    // Copy all pages
    const pageIndices = srcPdf.getPageIndices();
    totalPages += pageIndices.length;
    const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.({ percentage: 90, statusText: 'Menyimpan dan mengoptimalkan dokumen gabungan...' });

  const mergedPdfBytes = await mergedPdf.save({ useObjectStreams: true });
  const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  onProgress?.({ percentage: 100, statusText: 'Penggabungan berhasil selesai!' });

  return {
    blob,
    fileName: `merged_${Date.now()}.pdf`,
    fileSize: blob.size,
    downloadUrl,
    pagesCount: totalPages,
    isZip: false,
  };
}

/**
 * Split a PDF file into parts based on ranges, fixed intervals, or selected pages
 */
export async function splitPdf(
  file: File,
  options: SplitOptions,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.({ percentage: 10, statusText: 'Membaca dokumen PDF asli...' });

  const fileBuffer = await file.arrayBuffer();
  let srcPdf: PDFDocument;
  try {
    srcPdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
  } catch (err: any) {
    handlePdfLibLoadError(err, file.name);
  }

  const totalPages = srcPdf.getPageCount();

  if (totalPages === 0) {
    throw new Error('Dokumen PDF kosong atau tidak memiliki halaman.');
  }

  const baseName = file.name.replace(/\.pdf$/i, '');

  if (options.mode === 'selected') {
    // Mode: Extract specific selected pages into one PDF
    if (!options.selectedPages || options.selectedPages.length === 0) {
      throw new Error('Pilih minimal 1 halaman untuk diekstrak.');
    }

    onProgress?.({ percentage: 35, statusText: 'Mengekstrak halaman terpilih...' });
    const newPdf = await PDFDocument.create();
    // selectedPages are 1-indexed, convert to 0-indexed
    const zeroIndexed = options.selectedPages
      .filter((p) => p >= 1 && p <= totalPages)
      .map((p) => p - 1);

    const copiedPages = await newPdf.copyPages(srcPdf, zeroIndexed);
    copiedPages.forEach((p) => newPdf.addPage(p));

    onProgress?.({ percentage: 80, statusText: 'Menyusun dokumen PDF baru...' });
    const bytes = await newPdf.save({ useObjectStreams: true });
    const blob = new Blob([bytes as any], { type: 'application/pdf' });

    onProgress?.({ percentage: 100, statusText: 'Ekstraksi selesai!' });

    return {
      blob,
      fileName: `${baseName}_extracted.pdf`,
      fileSize: blob.size,
      downloadUrl: URL.createObjectURL(blob),
      pagesCount: copiedPages.length,
      isZip: false,
    };
  }

  if (options.mode === 'range') {
    // Parse range strings safely using comprehensive validator
    const groups = parsePageRange(options.rangeString, totalPages);

    if (groups.length === 1) {
      // Single group result -> directly return as 1 PDF
      onProgress?.({ percentage: 50, statusText: 'Membuat potongan dokumen...' });
      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(srcPdf, groups[0]);
      copied.forEach((p) => newPdf.addPage(p));
      const bytes = await newPdf.save({ useObjectStreams: true });
      const blob = new Blob([bytes as any], { type: 'application/pdf' });

      onProgress?.({ percentage: 100, statusText: 'Pemisahan selesai!' });
      return {
        blob,
        fileName: `${baseName}_split.pdf`,
        fileSize: blob.size,
        downloadUrl: URL.createObjectURL(blob),
        pagesCount: copied.length,
        isZip: false,
      };
    }

    // Multiple groups -> package into ZIP
    onProgress?.({ percentage: 30, statusText: 'Membuat paket ZIP potongan PDF...' });
    const zip = new JSZip();

    for (let i = 0; i < groups.length; i++) {
      const percent = Math.round(30 + (i / groups.length) * 55);
      onProgress?.({
        percentage: percent,
        statusText: `Menyimpan bagian ${i + 1} dari ${groups.length}...`,
      });

      const partPdf = await PDFDocument.create();
      const copied = await partPdf.copyPages(srcPdf, groups[i]);
      copied.forEach((p) => partPdf.addPage(p));
      const bytes = await partPdf.save({ useObjectStreams: true });
      zip.file(`${baseName}_part_${i + 1}.pdf`, bytes);
    }

    onProgress?.({ percentage: 90, statusText: 'Mengompresi file ZIP...' });
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    onProgress?.({ percentage: 100, statusText: 'Pemecahan ZIP selesai!' });
    return {
      blob: zipBlob,
      fileName: `${baseName}_split_parts.zip`,
      fileSize: zipBlob.size,
      downloadUrl: URL.createObjectURL(zipBlob),
      pagesCount: totalPages,
      isZip: true,
    };
  }

  // Mode: Fixed Interval
  const interval = Math.max(1, options.interval || 1);
  const zip = new JSZip();
  let partNumber = 1;

  for (let start = 0; start < totalPages; start += interval) {
    const end = Math.min(start + interval, totalPages);
    const pagesToCopy: number[] = [];
    for (let p = start; p < end; p++) pagesToCopy.push(p);

    const partPdf = await PDFDocument.create();
    const copied = await partPdf.copyPages(srcPdf, pagesToCopy);
    copied.forEach((p) => partPdf.addPage(p));
    const bytes = await partPdf.save({ useObjectStreams: true });

    zip.file(`${baseName}_part_${partNumber}.pdf`, bytes);
    partNumber++;

    const percent = Math.round(20 + (end / totalPages) * 70);
    onProgress?.({
      percentage: percent,
      statusText: `Memisahkan halaman ${start + 1} - ${end}...`,
    });
  }

  onProgress?.({ percentage: 95, statusText: 'Mengemas dokumen ke ZIP...' });
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress?.({ percentage: 100, statusText: 'Pemisahan selesai!' });
  return {
    blob: zipBlob,
    fileName: `${baseName}_split_all.zip`,
    fileSize: zipBlob.size,
    downloadUrl: URL.createObjectURL(zipBlob),
    pagesCount: totalPages,
    isZip: true,
  };
}

/**
 * Compress a PDF by re-sampling embedded raster canvas data and optimizing streams
 */
export async function compressPdf(
  file: File,
  options: CompressOptions,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.({ percentage: 5, statusText: 'Membaca struktur PDF untuk optimasi...' });

  const originalSize = file.size;
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await loadPdfJsDocument(new Uint8Array(arrayBuffer), file.name);
  const numPages = pdf.numPages;

  // Compression formula based on quality slider 1 - 9
  const quality = Math.min(Math.max(1, options.quality), 9);
  const scale = 0.5 + (quality / 9) * 0.8; // 0.6 to 1.3
  const jpegQuality = 0.35 + (quality / 9) * 0.45; // 0.40 to 0.80

  const compressedDoc = await PDFDocument.create();
  compressedDoc.setCreator('AeroPDF Studio');
  compressedDoc.setProducer('AeroPDF Optimizer Engine');

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = Math.round(10 + (pageNum / numPages) * 75);
    onProgress?.({
      percentage: percent,
      statusText: `Mengompresi halaman ${pageNum} dari ${numPages}...`,
      step: pageNum,
      totalSteps: numPages,
    });

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context tidak tersedia.');

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render({
      canvasContext: ctx,
      viewport,
      intent: 'print',
      canvas,
    } as any)).promise;

    // Apply grayscale filter if requested
    if (options.grayscale) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Convert directly to Blob to avoid massive string serialization in memory
    const imgBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', jpegQuality);
    });
    if (!imgBlob) throw new Error(`Gagal merender kompresi pada halaman ${pageNum}.`);

    const imgBytes = await imgBlob.arrayBuffer();
    const embeddedImage = await compressedDoc.embedJpg(imgBytes);

    // Get original page aspect ratio & dimensions in points (72 DPI points)
    const originalViewport = page.getViewport({ scale: 1 });
    const newPage = compressedDoc.addPage([originalViewport.width, originalViewport.height]);

    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: originalViewport.width,
      height: originalViewport.height,
    });

    // Cleanup page and canvas memory immediately to prevent memory ballooning
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.({ percentage: 90, statusText: 'Mengemas & membersihkan struktur PDF...' });

  const compressedBytes = await compressedDoc.save({ useObjectStreams: true });
  const blob = new Blob([compressedBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  const isEnlarged = blob.size > originalSize;
  const enlargedPercentage = isEnlarged
    ? Math.round(((blob.size - originalSize) / originalSize) * 100)
    : 0;
  const savings = !isEnlarged
    ? Math.max(0, Math.round(((originalSize - blob.size) / originalSize) * 100))
    : 0;

  onProgress?.({ percentage: 100, statusText: 'Kompresi berhasil selesai!' });

  return {
    blob,
    fileName: `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`,
    fileSize: blob.size,
    originalSize,
    savingsPercentage: savings,
    isEnlarged,
    enlargedPercentage,
    downloadUrl,
    pagesCount: numPages,
    isZip: false,
  };
}

/**
 * Convert multiple image files to a single unified PDF
 */
export async function imagesToPdf(
  images: File[],
  options: ImageToPdfOptions,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  if (images.length === 0) {
    throw new Error('Pilih minimal 1 gambar untuk dikonversi.');
  }

  onProgress?.({ percentage: 10, statusText: 'Menyiapkan dokumen PDF baru...' });

  const doc = await PDFDocument.create();
  doc.setCreator('AeroPDF Studio');
  doc.setProducer('AeroPDF Image Converter Engine');

  // Standard paper dimensions in points (72pt = 1 inch)
  const SIZES = {
    A4: { width: 595.28, height: 841.89 },
    Letter: { width: 612.0, height: 792.0 },
  };

  const MARGINS = {
    none: 0,
    small: 20,
    large: 40,
  };

  const margin = MARGINS[options.margin] || 0;

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const percent = Math.round(15 + (i / images.length) * 75);
    onProgress?.({
      percentage: percent,
      statusText: `Mengonversi gambar ${i + 1}/${images.length}: ${file.name}`,
      step: i + 1,
      totalSteps: images.length,
    });

    const imgBuffer = await file.arrayBuffer();
    let embeddedImg;

    // Check if directly supported or convert via canvas
    const isJpg = file.type === 'image/jpeg' || file.name.match(/\.(jpg|jpeg)$/i);
    const isPng = file.type === 'image/png' || file.name.match(/\.png$/i);

    if (isJpg) {
      try {
        embeddedImg = await doc.embedJpg(imgBuffer);
      } catch {
        embeddedImg = await embedViaCanvas(file, doc);
      }
    } else if (isPng) {
      try {
        embeddedImg = await doc.embedPng(imgBuffer);
      } catch {
        embeddedImg = await embedViaCanvas(file, doc);
      }
    } else {
      // WebP, SVG, GIF, BMP -> convert to PNG via canvas
      embeddedImg = await embedViaCanvas(file, doc);
    }

    const { width: imgW, height: imgH } = embeddedImg;

    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'fit') {
      pageWidth = imgW + margin * 2;
      pageHeight = imgH + margin * 2;
    } else {
      const base = SIZES[options.pageSize] || SIZES.A4;
      let isLandscape = false;

      if (options.orientation === 'auto') {
        isLandscape = imgW > imgH;
      } else if (options.orientation === 'landscape') {
        isLandscape = true;
      }

      pageWidth = isLandscape ? Math.max(base.width, base.height) : Math.min(base.width, base.height);
      pageHeight = isLandscape ? Math.min(base.width, base.height) : Math.max(base.width, base.height);
    }

    const page = doc.addPage([pageWidth, pageHeight]);

    // Available drawing area
    const availW = pageWidth - margin * 2;
    const availH = pageHeight - margin * 2;

    let drawW: number;
    let drawH: number;

    if (options.fitMode === 'cover') {
      const scale = Math.max(availW / imgW, availH / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
    } else {
      // contain
      const scale = Math.min(availW / imgW, availH / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;
    }

    const x = margin + (availW - drawW) / 2;
    const y = margin + (availH - drawH) / 2;

    page.drawImage(embeddedImg, {
      x,
      y,
      width: drawW,
      height: drawH,
    });
  }

  onProgress?.({ percentage: 92, statusText: 'Menyelesaikan dokumen PDF...' });

  const pdfBytes = await doc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);

  onProgress?.({ percentage: 100, statusText: 'Konversi gambar ke PDF berhasil!' });

  return {
    blob,
    fileName: `images_converted_${Date.now()}.pdf`,
    fileSize: blob.size,
    downloadUrl,
    pagesCount: images.length,
    isZip: false,
  };
}

/**
 * Helper to embed images using an intermediate canvas
 */
async function embedViaCanvas(file: File, doc: PDFDocument) {
  return new Promise<any>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D unavailable'));
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        const pngBuffer = await blob.arrayBuffer();
        canvas.width = 0;
        canvas.height = 0;
        const embedded = await doc.embedPng(pngBuffer);
        resolve(embedded);
      }, 'image/png');
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Rotate pages of a PDF document
 */
export async function rotatePdf(
  file: File,
  options: RotateOptions,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.({ percentage: 15, statusText: 'Membaca dokumen PDF...' });

  const buffer = await file.arrayBuffer();
  let pdfDoc: PDFDocument;
  try {
    pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  } catch (err: any) {
    handlePdfLibLoadError(err, file.name);
  }

  const pages = pdfDoc.getPages();
  const total = pages.length;

  onProgress?.({ percentage: 40, statusText: `Memutar halaman sebesar ${options.angle}°...` });

  pages.forEach((page, idx) => {
    const pageNum = idx + 1;
    let shouldRotate = false;

    if (options.applyTo === 'all') {
      shouldRotate = true;
    } else if (options.applyTo === 'odd') {
      shouldRotate = pageNum % 2 !== 0;
    } else if (options.applyTo === 'even') {
      shouldRotate = pageNum % 2 === 0;
    } else if (options.applyTo === 'selected' && options.selectedPages) {
      shouldRotate = options.selectedPages.includes(pageNum);
    }

    if (shouldRotate) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + options.angle) % 360));
    }
  });

  onProgress?.({ percentage: 80, statusText: 'Menyimpan rotasi halaman...' });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

  onProgress?.({ percentage: 100, statusText: 'Rotasi selesai!' });

  return {
    blob,
    fileName: `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`,
    fileSize: blob.size,
    downloadUrl: URL.createObjectURL(blob),
    pagesCount: total,
    isZip: false,
  };
}

/**
 * Convert PDF pages to high-quality PNG images and package into a ZIP
 */
export async function pdfToImages(
  file: File,
  onProgress?: ProgressCallback
): Promise<ProcessResult> {
  onProgress?.({ percentage: 5, statusText: 'Membuka dokumen PDF...' });

  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfJsDocument(new Uint8Array(buffer), file.name);
  const numPages = pdf.numPages;
  const zip = new JSZip();
  const baseName = file.name.replace(/\.pdf$/i, '');

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = Math.round(10 + (pageNum / numPages) * 75);
    onProgress?.({
      percentage: percent,
      statusText: `Merender halaman ${pageNum} dari ${numPages} ke gambar...`,
      step: pageNum,
      totalSteps: numPages,
    });

    const page = await pdf.getPage(pageNum);
    // 2.0 scale for crisp, readable 150-200 DPI images
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render({
      canvasContext: ctx,
      viewport,
      intent: 'print',
      canvas,
    } as any)).promise;

    // Convert directly to Blob to avoid massive string serialization in memory
    const imgBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });
    if (!imgBlob) throw new Error(`Gagal merender halaman ${pageNum} ke gambar.`);

    const imgBuffer = await imgBlob.arrayBuffer();
    const pagePadded = String(pageNum).padStart(3, '0');
    zip.file(`${baseName}_page_${pagePadded}.png`, imgBuffer);

    // Free canvas bitmap and PDF.js page resources immediately
    page.cleanup();
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.({ percentage: 90, statusText: 'Mengemas gambar ke file ZIP...' });

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress?.({ percentage: 100, statusText: 'Konversi PDF ke gambar selesai!' });

  return {
    blob: zipBlob,
    fileName: `${baseName}_images.zip`,
    fileSize: zipBlob.size,
    downloadUrl: URL.createObjectURL(zipBlob),
    pagesCount: numPages,
    isZip: true,
  };
}
