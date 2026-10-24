import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

interface PdfViewerModalProps {
  url: string | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ url, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    if (!url) return;
    let isCancelled = false;

    const loadingTask = pdfjsLib.getDocument({ url });
    loadingTask.promise
      .then((pdf) => {
        if (!isCancelled) {
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error loading preview PDF:', err);
        }
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy();
    };
  }, [url]);

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

  if (!url) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Pratinjau Hasil Dokumen PDF</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Tutup pratinjau">
            <X size={18} />
          </button>
        </div>

        {/* Body Canvas */}
        <div className="modal-body">
          <canvas ref={canvasRef} />
        </div>

        {/* Footer Navigation */}
        <div className="modal-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              className="btn-secondary"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              Berikutnya <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="icon-btn"
              onClick={() => setZoomScale((s) => Math.max(0.6, s - 0.2))}
              title="Perkecil"
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              className="icon-btn"
              onClick={() => setZoomScale((s) => Math.min(2.5, s + 0.2))}
              title="Perbesar"
            >
              <ZoomIn size={16} />
            </button>

            <a
              href={url}
              download="document_preview.pdf"
              className="btn-download"
              style={{ padding: '6px 16px', fontSize: '0.85rem' }}
            >
              <Download size={14} /> Unduh PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
