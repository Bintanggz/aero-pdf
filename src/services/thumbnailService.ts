import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

/**
 * Extracts page count and renders a thumbnail of page 1 for a PDF file
 */
export async function getPdfInfoAndThumbnail(file: File): Promise<{ pageCount: number; thumbnailUrl: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;

    // Render page 1 thumbnail
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    
    // Scale down to max width 220px for thumbnail
    const targetWidth = 220;
    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }

    await (page.render({
      canvasContext: context,
      viewport: scaledViewport,
      intent: 'display',
      canvas,
    } as any)).promise;

    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

    return { pageCount, thumbnailUrl };
  } catch (err) {
    console.warn(`Could not generate thumbnail for ${file.name}:`, err);
    return { pageCount: 1, thumbnailUrl: '' };
  }
}

/**
 * Renders thumbnail for image files (JPG, PNG, WebP, etc.)
 */
export async function getImageThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve((e.target?.result as string) || '');
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Render a specific page of a PDF file to a canvas
 */
export async function renderPdfPage(
  file: File,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth = 600
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const page = await pdf.getPage(pageNumber);

  const originalViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / originalViewport.width;
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  await (page.render({
    canvasContext: ctx,
    viewport,
    canvas,
  } as any)).promise;
}
