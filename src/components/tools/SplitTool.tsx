import React, { useState, useEffect, useRef } from 'react';
import { Scissors, Loader2, CheckSquare, Square } from 'lucide-react';
import { DropZone } from '../DropZone';
import { ResultCard } from '../ResultCard';
import type { UploadedFileItem, SplitOptions, ProcessResult, ProcessProgress } from '../../types';
import { splitPdf } from '../../services/pdfService';
import { safeRevokeUrl } from '../../utils/urlUtils';

interface SplitToolProps {
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

export const SplitTool: React.FC<SplitToolProps> = ({ onPreviewPdf, onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [options, setOptions] = useState<SplitOptions>({
    mode: 'range',
    rangeString: '1-2',
    interval: 1,
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
  const totalPages = currentFile?.pageCount || 0;

  const togglePageSelection = (pageNum: number) => {
    const exists = options.selectedPages.includes(pageNum);
    const updated = exists
      ? options.selectedPages.filter((p) => p !== pageNum)
      : [...options.selectedPages, pageNum].sort((a, b) => a - b);
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
      onError('Silakan pilih 1 file PDF yang ingin dipisahkan.');
      return;
    }

    try {
      setIsProcessing(true);
      safeRevokeUrl(result?.downloadUrl);
      setResult(null);

      const res = await splitPdf(currentFile.file, options, (prog) => {
        setProgress(prog);
      });

      setResult(res);
    } catch (err: any) {
      onError(err?.message || 'Gagal memisahkan file PDF.');
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
      mode: 'range',
      rangeString: '1-2',
      interval: 1,
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
            description="Pilih file PDF yang ingin dipecah halamannya"
            onError={onError}
          />

          {currentFile && (
            <div className="options-panel">
              <h3 className="options-title">
                <Scissors size={18} /> Metode Pemisahan PDF
              </h3>

              {/* Mode Selection */}
              <div className="options-group">
                <label className="options-label">Pilih Cara Pemisahan:</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.mode === 'range' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, mode: 'range' })}
                  >
                    Rentang Halaman Kustom
                  </button>
                  <button
                    className={`radio-pill ${options.mode === 'interval' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, mode: 'interval' })}
                  >
                    Interval Tetap (Setiap N Halaman)
                  </button>
                  <button
                    className={`radio-pill ${options.mode === 'selected' ? 'active' : ''}`}
                    onClick={() => setOptions({ ...options, mode: 'selected' })}
                  >
                    Ekstrak Halaman Pilihan ({options.selectedPages.length} dipilih)
                  </button>
                </div>
              </div>

              {/* Range Mode Config */}
              {options.mode === 'range' && (
                <div className="options-group">
                  <label className="options-label">
                    Masukkan Rentang Halaman (Total: {totalPages} halaman):
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: 1-3, 4-7, 8"
                    value={options.rangeString}
                    onChange={(e) => setOptions({ ...options, rangeString: e.target.value })}
                  />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Gunakan tanda strip (-) untuk rentang dan koma (,) untuk memisahkan file. Contoh: <code>1-3, 4-5</code> akan menghasilkan 2 file terpisah.
                  </p>
                </div>
              )}

              {/* Interval Mode Config */}
              {options.mode === 'interval' && (
                <div className="options-group">
                  <label className="options-label">Pisahkan Dokumen Setiap:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, totalPages)}
                      className="form-input"
                      style={{ maxWidth: '140px' }}
                      value={options.interval}
                      onChange={(e) => setOptions({ ...options, interval: parseInt(e.target.value, 10) || 1 })}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Halaman per file (akan menghasilkan sekitar {Math.ceil(totalPages / Math.max(1, options.interval))} file dalam ZIP)
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Mode Config */}
              {options.mode === 'selected' && (
                <div className="options-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label className="options-label" style={{ marginBottom: 0 }}>
                      Klik Halaman yang Ingin Diambil:
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
                      const isSelected = options.selectedPages.includes(p);
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

          {/* Action Bar */}
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
                    <span>Sedang Memproses Pemisahan...</span>
                  </>
                ) : (
                  <>
                    <Scissors size={20} />
                    <span>Pisahkan PDF Sekarang</span>
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
          onPreview={!result.isZip ? () => onPreviewPdf(result.downloadUrl) : undefined}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
