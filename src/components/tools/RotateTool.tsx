import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, Loader2, CheckSquare, Square } from 'lucide-react';
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
    selectedPages: [],
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
  const totalPages = currentFile?.pageCount || 1;

  const togglePageSelection = (pageNum: number) => {
    const currentList = options.selectedPages || [];
    const exists = currentList.includes(pageNum);
    const updated = exists
      ? currentList.filter((p) => p !== pageNum)
      : [...currentList, pageNum].sort((a, b) => a - b);
    setOptions({ ...options, selectedPages: updated });
  };

  const selectAllPages = () => {
    const all = Array.from({ length: totalPages }, (_, i) => i + 1);
    setOptions({ ...options, selectedPages: all });
  };

  const deselectAllPages = () => {
    setOptions({ ...options, selectedPages: [] });
  };

  const handleExecute = async () => {
    if (!currentFile) {
      onError('Silakan pilih file PDF yang ingin diputar.');
      return;
    }

    if (options.applyTo === 'selected' && (!options.selectedPages || options.selectedPages.length === 0)) {
      onError('Silakan pilih minimal 1 halaman yang ingin diputar.');
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
    setOptions({
      angle: 90,
      applyTo: 'all',
      selectedPages: [],
    });
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
                    Halaman Ganjil (1, 3, 5...)
                  </button>
                  <button
                    className={`radio-pill ${options.applyTo === 'even' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, applyTo: 'even' })}
                  >
                    Halaman Genap (2, 4, 6...)
                  </button>
                  <button
                    className={`radio-pill ${options.applyTo === 'selected' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, applyTo: 'selected' })}
                  >
                    Pilih Halaman Tertentu ({options.selectedPages?.length || 0} dipilih)
                  </button>
                </div>
              </div>

              {/* Interactive Page Selector when applyTo === 'selected' */}
              {options.applyTo === 'selected' && (
                <div className="options-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="options-label" style={{ marginBottom: 0 }}>
                      Klik Halaman yang Ingin Diputar (Total: {totalPages} Halaman):
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="radio-pill" onClick={selectAllPages} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Pilih Semua
                      </button>
                      <button className="radio-pill" onClick={deselectAllPages} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Hapus Pilihan
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const isSelected = options.selectedPages?.includes(p) || false;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePageSelection(p)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--accent-primary)' : 'var(--bg-input)',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                          <span>Hal {p}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
