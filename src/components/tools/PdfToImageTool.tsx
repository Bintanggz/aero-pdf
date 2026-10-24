import React, { useState, useEffect, useRef } from 'react';
import { FileImage, Loader2 } from 'lucide-react';
import { DropZone } from '../DropZone';
import { ResultCard } from '../ResultCard';
import type { UploadedFileItem, ProcessResult, ProcessProgress } from '../../types';
import { pdfToImages } from '../../services/pdfService';
import { safeRevokeUrl } from '../../utils/urlUtils';

interface PdfToImageToolProps {
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

export const PdfToImageTool: React.FC<PdfToImageToolProps> = ({ onError }) => {
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
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
      onError('Silakan pilih file PDF yang ingin diubah menjadi gambar.');
      return;
    }

    try {
      setIsProcessing(true);
      safeRevokeUrl(result?.downloadUrl);
      setResult(null);

      const res = await pdfToImages(currentFile.file, (prog) => {
        setProgress(prog);
      });

      setResult(res);
    } catch (err: any) {
      onError(err?.message || 'Gagal mengubah halaman PDF ke gambar.');
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
            description="Setiap halaman akan dikonversi menjadi gambar PNG beresolusi tinggi"
            onError={onError}
          />

          {currentFile && (
            <div className="options-panel">
              <h3 className="options-title">
                <FileImage size={18} /> Detail Konversi Gambar
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Dokumen <strong>{currentFile.name}</strong> memiliki <strong>{currentFile.pageCount || 1} halaman</strong>.
                Seluruh halaman akan dirender dengan ketajaman 2x (retina display) ke format <code>.png</code> dan dikemas ke dalam satu file ZIP.
              </p>
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
                    <span>Sedang Merender Gambar...</span>
                  </>
                ) : (
                  <>
                    <FileImage size={20} />
                    <span>Konversi Semua Halaman ke PNG (ZIP)</span>
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
          onReset={handleReset}
        />
      )}
    </div>
  );
};
