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
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    if (!url) return;
    let isCancelled = false;
    let loadedPdf: any = null;

    const loadingTask = pdfjsLib.getDocument({ url });
    loadingTask.promise
      .then((pdf) => {
        if (!isCancelled) {
          loadedPdf = pdf;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(1);
        } else {
          pdf.cleanup();
          loadingTask.destroy();
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error loading preview PDF:', err);
        }
      });

    return () => {
      isCancelled = true;
      try {
        loadingTask.destroy();
      } catch {
        // ignore
      }
      if (loadedPdf) {
        try {
          loadedPdf.cleanup();
        } catch {
          // ignore
        }
      }
    };
  }, [url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let isCancelled = false;
    let pageObj: any = null;

    // Cancel any ongoing render task before starting a new one
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {
        // ignore
      }
      renderTaskRef.current = null;
    }

    pdfDoc.getPage(currentPage).then((page: any) => {
      if (isCancelled) return;
      pageObj = page;
      const viewport = page.getViewport({ scale: zoomScale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });
      renderTaskRef.current = renderTask;

      renderTask.promise
        .catch((err: any) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error('Error rendering preview page:', err);
          }
        })
        .finally(() => {
          if (renderTaskRef.current === renderTask) {
            renderTaskRef.current = null;
          }
        });
    });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }
      if (pageObj) {
        try {
          pageObj.cleanup();
        } catch {
          // ignore
        }
      }
    };
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
