import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { DropZone } from '../DropZone';
import { ResultCard } from '../ResultCard';
import type { UploadedFileItem, ImageToPdfOptions, ProcessResult, ProcessProgress } from '../../types';
import { imagesToPdf } from '../../services/pdfService';
import { safeRevokeUrl } from '../../utils/urlUtils';

interface ImageToPdfToolProps {
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

export const ImageToPdfTool: React.FC<ImageToPdfToolProps> = ({ onPreviewPdf, onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [options, setOptions] = useState<ImageToPdfOptions>({
    pageSize: 'A4',
    orientation: 'auto',
    margin: 'small',
    fitMode: 'contain',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessProgress | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    resultUrlRef.current = result?.downloadUrl || null;
  }, [result]);

  useEffect(() => {
    return () => {
      safeRevokeUrl(resultUrlRef.current);
    };
  }, []);

  const handleExecute = async () => {
    if (files.length === 0) {
      onError('Silakan pilih minimal 1 gambar untuk dikonversi ke PDF.');
      return;
    }

    try {
      setIsProcessing(true);
      safeRevokeUrl(result?.downloadUrl);
      setResult(null);

      const actualImages = files.map((f) => f.file);
      const res = await imagesToPdf(actualImages, options, (prog) => {
        setProgress(prog);
      });

      setResult(res);
    } catch (err: any) {
      onError(err?.message || 'Gagal mengonversi gambar ke PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    safeRevokeUrl(result?.downloadUrl);
    setFiles([]);
    setResult(null);
    setProgress(null);
  };

  return (
    <div className="workspace-container">
      {!result && (
        <>
          <DropZone
            files={files}
            onFilesChange={setFiles}
            acceptedTypes={['.jpg', '.jpeg', '.png', '.webp', '.svg', '.bmp']}
            multiple={true}
            title="Tarik & Jatuhkan Gambar ke Sini"
            description="Pilih foto atau gambar (JPG, PNG, WebP) untuk dijadikan PDF"
            onError={onError}
          />

          {files.length > 0 && (
            <div className="options-panel">
              <h3 className="options-title">
                <ImageIcon size={18} /> Format & Tata Letak Halaman PDF
              </h3>

              {/* Page Size */}
              <div className="options-group">
                <label className="options-label">Ukuran Kertas:</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.pageSize === 'A4' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, pageSize: 'A4' })}
                  >
                    Standar A4
                  </button>
                  <button
                    className={`radio-pill ${options.pageSize === 'Letter' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, pageSize: 'Letter' })}
                  >
                    US Letter
                  </button>
                  <button
                    className={`radio-pill ${options.pageSize === 'fit' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, pageSize: 'fit' })}
                  >
                    Sesuaikan Ukuran Gambar Asli
                  </button>
                </div>
              </div>

              {/* Orientation (Only for A4/Letter) */}
              {options.pageSize !== 'fit' && (
                <div className="options-group">
                  <label className="options-label">Orientasi Halaman:</label>
                  <div className="radio-pill-group">
                    <button
                      className={`radio-pill ${options.orientation === 'auto' ? 'active' : ''}`}
                      onClick={() => setOptions({ ...options, orientation: 'auto' })}
                    >
                      Otomatis (Sesuai Tiap Foto)
                    </button>
                    <button
                      className={`radio-pill ${options.orientation === 'portrait' ? 'active' : ''}`}
                      onClick={() => setOptions({ ...options, orientation: 'portrait' })}
                    >
                      Tegak (Portrait)
                    </button>
                    <button
                      className={`radio-pill ${options.orientation === 'landscape' ? 'active' : ''}`}
                      onClick={() => setOptions({ ...options, orientation: 'landscape' })}
                    >
                      Mendatar (Landscape)
                    </button>
                  </div>
                </div>
              )}

              {/* Margins */}
              <div className="options-group">
                <label className="options-label">Margin Tepi Kertas:</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.margin === 'none' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, margin: 'none' })}
                  >
                    Tanpa Margin (Full Edge)
                  </button>
                  <button
                    className={`radio-pill ${options.margin === 'small' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, margin: 'small' })}
                  >
                    Margin Tipis (Normal)
                  </button>
                  <button
                    className={`radio-pill ${options.margin === 'large' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, margin: 'large' })}
                  >
                    Margin Lebar
                  </button>
                </div>
              </div>

              {/* Fit Mode */}
              <div className="options-group">
                <label className="options-label">Penyesuaian Skala Gambar:</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.fitMode === 'contain' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, fitMode: 'contain' })}
                  >
                    Pertahankan Rasio (Tanpa Terpotong)
                  </button>
                  <button
                    className={`radio-pill ${options.fitMode === 'cover' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, fitMode: 'cover' })}
                  >
                    Penuhi Halaman (Zoom to Fill)
                  </button>
                </div>
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="execute-bar">
              {isProcessing && progress && (
                <div className="progress-box">
                  <div className="progress-header">
                    <span>{progress.statusText}</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                  </div>
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleExecute}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Mengonversi {files.length} Gambar...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} />
                    <span>Konversi {files.length} Gambar ke PDF</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {result && (
        <ResultCard
          result={result}
          onPreview={() => onPreviewPdf(result.downloadUrl)}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
