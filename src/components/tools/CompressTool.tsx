import React, { useState, useEffect, useRef } from 'react';
import { Minimize2, Loader2, Sparkles, Sliders, Info } from 'lucide-react';
import { DropZone } from '../DropZone';
import { ResultCard } from '../ResultCard';
import type { UploadedFileItem, CompressOptions, ProcessResult, ProcessProgress } from '../../types';
import { compressPdf } from '../../services/pdfService';
import { safeRevokeUrl } from '../../utils/urlUtils';

interface CompressToolProps {
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

export const CompressTool: React.FC<CompressToolProps> = ({ onPreviewPdf, onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [options, setOptions] = useState<CompressOptions>({
    quality: 5,
    grayscale: false,
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

  const setPreset = (lvl: number) => {
    setOptions({ ...options, quality: lvl });
  };

  const getPresetLabel = (val: number) => {
    if (val <= 3) return 'Kompresi Tinggi (File Paling Kecil)';
    if (val <= 6) return 'Kompresi Seimbang (Direkomendasikan)';
    return 'Kualitas Tinggi (Pengurangan Ringan)';
  };

  const handleExecute = async () => {
    if (!currentFile) {
      onError('Silakan pilih file PDF yang ingin dikompresi.');
      return;
    }

    try {
      setIsProcessing(true);
      safeRevokeUrl(result?.downloadUrl);
      setResult(null);

      const res = await compressPdf(currentFile.file, options, (prog) => {
        setProgress(prog);
      });

      setResult(res);
    } catch (err: any) {
      onError(err?.message || 'Gagal mengompresi file PDF.');
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
            description="Pilih dokumen PDF yang ukurannya ingin dikecilkan"
            onError={onError}
          />

          {currentFile && (
            <div className="options-panel">
              <h3 className="options-title">
                <Minimize2 size={18} /> Pengaturan Kompresi Dokumen
              </h3>

              {/* Technical Notice Banner */}
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  color: 'var(--text-secondary)',
                }}
              >
                <Info size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Cara Kerja Kompresi Klien:</strong> Mesin kompresi mengoptimalkan dokumen dengan merasterisasi ulang kanvas halaman ke resolusi efisien. Teknik ini sangat efektif untuk PDF hasil scan atau PDF yang memuat banyak foto/gambar besar. Untuk dokumen teks/vektor murni, rasterisasi dapat mengubah teks menjadi gambar raster beresolusi kompak.
                </div>
              </div>

              {/* Quality Presets */}
              <div className="options-group">
                <label className="options-label">Preset Tingkat Kompresi:</label>
                <div className="radio-pill-group">
                  <button
                    className={`radio-pill ${options.quality === 2 ? 'active' : ''}`}
                    onClick={() => setPreset(2)}
                  >
                    Ekstrem (Level 2)
                  </button>
                  <button
                    className={`radio-pill ${options.quality === 5 ? 'active' : ''}`}
                    onClick={() => setPreset(5)}
                  >
                    <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Standar Seimbang (Level 5)
                  </button>
                  <button
                    className={`radio-pill ${options.quality === 8 ? 'active' : ''}`}
                    onClick={() => setPreset(8)}
                  >
                    Ringan (Level 8)
                  </button>
                </div>
              </div>

              {/* Slider Quality */}
              <div className="options-group">
                <label className="options-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    <Sliders size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Penyesuaian Kualitas Raster:
                  </span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                    {getPresetLabel(options.quality)}
                  </span>
                </label>
                <div className="slider-container">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ukuran Minimum</span>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    step="1"
                    className="range-slider"
                    value={options.quality}
                    onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value, 10) })}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kualitas Maksimum</span>
                  <div className="slider-val-badge">Lvl {options.quality}</div>
                </div>
              </div>

              {/* Grayscale Toggle */}
              <div className="options-group" style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <label className="checkbox-toggle">
                  <input
                    type="checkbox"
                    checked={options.grayscale}
                    onChange={(e) => setOptions({ ...options, grayscale: e.target.checked })}
                  />
                  <div>
                    <span>Konversi Gambar ke Abu-abu (Grayscale)</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                      Mengubah elemen warna menjadi monokrom untuk penghematan ukuran ekstra 30% - 50%.
                    </p>
                  </div>
                </label>
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
                    <span>Sedang Mengoptimalkan Dokumen...</span>
                  </>
                ) : (
                  <>
                    <Minimize2 size={20} />
                    <span>Kompres PDF Sekarang</span>
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
