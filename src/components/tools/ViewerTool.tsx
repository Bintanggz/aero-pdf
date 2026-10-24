import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { DropZone } from '../DropZone';
import type { UploadedFileItem } from '../../types';
import * as pdfjsLib from 'pdfjs-dist';

interface ViewerToolProps {
  onError: (msg: string) => void;
}

export const ViewerTool: React.FC<ViewerToolProps> = ({ onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const currentFile = files[0];

  // Load PDF document
  useEffect(() => {
    if (!currentFile) return;
    let isCancelled = false;

    currentFile.file
      .arrayBuffer()
      .then((buf) => {
        if (isCancelled) return null;
        return pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      })
      .then((pdf) => {
        if (pdf && !isCancelled) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
        }
      })
      .catch((e: any) => {
        if (!isCancelled) {
          const msg = e?.message?.toLowerCase() || '';
          if (e?.name === 'PasswordException' || msg.includes('password')) {
            onError('Dokumen PDF ini memerlukan kata sandi untuk dibuka. Silakan gunakan dokumen tanpa proteksi kata sandi.');
          } else {
            onError('Gagal membuka file PDF untuk ditampilkan: ' + e.message);
          }
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentFile, onError]);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    pdfDoc.getPage(currentPage).then((page: any) => {
      const viewport = page.getViewport({ scale: zoomScale });
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      page.render({
        canvasContext: ctx,
        viewport,
      });
    });
  }, [pdfDoc, currentPage, zoomScale]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleZoomIn = () => setZoomScale((s) => Math.min(2.5, s + 0.2));
  const handleZoomOut = () => setZoomScale((s) => Math.max(0.6, s - 0.2));

  return (
    <div className="workspace-container">
      {!currentFile ? (
        <DropZone
          files={files}
          onFilesChange={setFiles}
          acceptedTypes={['.pdf']}
          multiple={false}
          title="Tarik & Jatuhkan File PDF untuk Dibaca"
          description="Buka dan periksa dokumen PDF secara langsung dan privat"
          onError={onError}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn-secondary"
                onClick={handlePrev}
                disabled={currentPage <= 1}
                style={{ padding: '6px 14px' }}
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                className="btn-secondary"
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                style={{ padding: '6px 14px' }}
              >
                Berikutnya <ChevronRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="icon-btn" onClick={handleZoomOut} title="Perkecil">
                <ZoomOut size={16} />
              </button>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button className="icon-btn" onClick={handleZoomIn} title="Perbesar">
                <ZoomIn size={16} />
              </button>

              <button
                className="btn-secondary"
                onClick={() => setFiles([])}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                Tutup Dokumen
              </button>
            </div>
          </div>

          {/* Canvas View */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '24px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              overflowX: 'auto',
            }}
          >
            <canvas ref={canvasRef} style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} />
          </div>
        </div>
      )}
    </div>
  );
};
