import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Loader2 } from 'lucide-react';
import { DropZone } from '../DropZone';
import { ResultCard } from '../ResultCard';
import type { UploadedFileItem, RotateOptions, ProcessResult, ProcessProgress } from '../../types';
import { rotatePdf } from '../../services/pdfService';
import { safeRevokeUrl } from '../../utils/urlUtils';

interface RotateToolProps {
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

export const RotateTool: React.FC<RotateToolProps> = ({ onPreviewPdf, onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [options, setOptions] = useState<RotateOptions>({
    angle: 90,
    applyTo: 'all',
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

  const currentFile = files[0];

  const handleExecute = async () => {
    if (!currentFile) {
      onError('Silakan pilih file PDF yang ingin diputar.');
      return;
    }

    try {
      setIsProcessing(true);
      safeRevokeUrl(result?.downloadUrl);
      setResult(null);

      const res = await rotatePdf(currentFile.file, options, (prog) => {
        setProgress(prog);
      });

      setResult(res);
    } catch (err: any) {
      onError(err?.message || 'Gagal memutar halaman PDF.');
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
            acceptedTypes={['.pdf']}
            multiple={false}
            title="Tarik & Jatuhkan File PDF ke Sini"
            description="Pilih dokumen PDF yang orientasi halamannya ingin diputar"
            onError={onError}
          />

          {currentFile && (
            <div className="options-panel">
              <h3 className="options-title">
                <RotateCw size={18} /> Pengaturan Rotasi Halaman
              </h3>

              {/* Angle */}
              <div className="options-group">
                <label className="options-label">Sudut Putaran (Searah Jarum Jam):</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.angle === 90 ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, angle: 90 })}
                  >
                    90° (Kanan)
                  </button>
                  <button
                    className={`radio-pill ${options.angle === 180 ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, angle: 180 })}
                  >
                    180° (Balik Bawah)
                  </button>
                  <button
                    className={`radio-pill ${options.angle === 270 ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, angle: 270 })}
                  >
                    270° (Kiri)
                  </button>
                </div>
              </div>

              {/* Apply to */}
              <div className="options-group">
                <label className="options-label">Terapkan Pada:</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.applyTo === 'all' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, applyTo: 'all' })}
                  >
                    Semua Halaman
                  </button>
                  <button
                    className={`radio-pill ${options.applyTo === 'odd' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, applyTo: 'odd' })}
                  >
                    Hanya Halaman Ganjil (1, 3, 5...)
                  </button>
                  <button
                    className={`radio-pill ${options.applyTo === 'even' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, applyTo: 'even' })}
                  >
                    Hanya Halaman Genap (2, 4, 6...)
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentFile && (
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
                    <span>Memutar Halaman...</span>
                  </>
                ) : (
                  <>
                    <RotateCw size={20} />
                    <span>Putar Dokumen Sekarang</span>
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
