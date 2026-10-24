import React, { useState, useEffect, useRef } from 'react';
import { Layers, ArrowUpDown, Loader2 } from 'lucide-react';
import { DropZone } from '../DropZone';
import { ResultCard } from '../ResultCard';
import type { UploadedFileItem, MergeOptions, ProcessResult, ProcessProgress } from '../../types';
import { mergePdfs } from '../../services/pdfService';
import { safeRevokeUrl } from '../../utils/urlUtils';

interface MergeToolProps {
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

export const MergeTool: React.FC<MergeToolProps> = ({ onPreviewPdf, onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [options, setOptions] = useState<MergeOptions>({
    generateToc: false,
    stripSignatures: true,
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

  const handleSortAsc = () => {
    const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name));
    setFiles(sorted);
  };

  const handleSortDesc = () => {
    const sorted = [...files].sort((a, b) => b.name.localeCompare(a.name));
    setFiles(sorted);
  };

  const handleReverse = () => {
    setFiles([...files].reverse());
  };

  const handleExecute = async () => {
    if (files.length < 2) {
      onError('Silakan pilih minimal 2 file PDF untuk digabungkan.');
      return;
    }

    try {
      setIsProcessing(true);
      safeRevokeUrl(result?.downloadUrl);
      setResult(null);

      const actualFiles = files.map((f) => f.file);
      const res = await mergePdfs(actualFiles, options, (prog) => {
        setProgress(prog);
      });

      setResult(res);
    } catch (err: any) {
      onError(err?.message || 'Gagal menggabungkan file PDF.');
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
      {/* Upload DropZone */}
      {!result && (
        <>
          <DropZone
            files={files}
            onFilesChange={setFiles}
            acceptedTypes={['.pdf']}
            multiple={true}
            title="Tarik & Jatuhkan File PDF ke Sini"
            description="Pilih 2 atau lebih file PDF untuk digabungkan menjadi 1 file rapi"
            onError={onError}
          />

          {/* Quick Sort Controls */}
          {files.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpDown size={14} /> Urutkan:
              </span>
              <button className="radio-pill" onClick={handleSortAsc}>
                Nama A &rarr; Z
              </button>
              <button className="radio-pill" onClick={handleSortDesc}>
                Nama Z &rarr; A
              </button>
              <button className="radio-pill" onClick={handleReverse}>
                Balik Urutan
              </button>
            </div>
          )}

          {/* Options Panel */}
          {files.length >= 2 && (
            <div className="options-panel">
              <h3 className="options-title">
                <Layers size={18} /> Opsi Penggabungan
              </h3>

              <div className="options-group">
                <label className="checkbox-toggle">
                  <input
                    type="checkbox"
                    checked={options.generateToc}
                    onChange={(e) => setOptions({ ...options, generateToc: e.target.checked })}
                  />
                  <div>
                    <span>Sertakan Metadata Judul & Ringkasan File Gabungan</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                      Menyimpan rincian berkas yang digabungkan ke dalam metadata PDF. (Catatan: Bookmark interaktif /Outlines memerlukan server dan belum didukung engine browser).
                    </p>
                  </div>
                </label>
              </div>

              <div className="options-group">
                <label className="checkbox-toggle">
                  <input
                    type="checkbox"
                    checked={options.stripSignatures}
                    onChange={(e) => setOptions({ ...options, stripSignatures: e.target.checked })}
                  />
                  <div>
                    <span>Bersihkan tanda tangan digital lama yang tidak valid lagi setelah digabung</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Execute Bar */}
          {files.length >= 2 && (
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
                    <span>Sedang Menggabungkan {files.length} File...</span>
                  </>
                ) : (
                  <>
                    <Layers size={20} />
                    <span>Gabungkan {files.length} PDF Sekarang</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Result Card */}
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
