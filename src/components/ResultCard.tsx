import React from 'react';
import { CheckCircle2, Download, Eye, RefreshCw, Archive, AlertTriangle } from 'lucide-react';
import type { ProcessResult } from '../types';

interface ResultCardProps {
  result: ProcessResult;
  onPreview?: () => void;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onPreview,
  onReset,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isEnlarged = Boolean(result.isEnlarged);

  return (
    <div className="result-card">
      <div
        className="result-icon-circle"
        style={
          isEnlarged
            ? { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }
            : undefined
        }
      >
        {isEnlarged ? (
          <AlertTriangle size={32} />
        ) : result.isZip ? (
          <Archive size={32} />
        ) : (
          <CheckCircle2 size={32} />
        )}
      </div>

      <h2 className="result-title">
        {isEnlarged ? 'Kompresi Selesai (Ukuran Bertambah)' : 'Operasi Berhasil Diselesaikan!'}
      </h2>
      <p className="result-subtitle">
        {isEnlarged
          ? 'Perhatian: File hasil rasterisasi berukuran lebih besar dari aslinya. File asli Anda sudah sangat optimal.'
          : 'Dokumen baru Anda telah siap diunduh langsung tanpa watermark dan tanpa batasan.'}
      </p>

      {isEnlarged && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '10px auto 16px',
            maxWidth: '560px',
            fontSize: '0.84rem',
            color: '#fbbf24',
            textAlign: 'left',
            lineHeight: 1.5,
          }}
        >
          <strong>Penjelasan Teknis:</strong> Dokumen asli Anda berbasis teks/vektor murni. Ketika dikompresi dengan metode re-rasterisasi kanvas, teks dikonversi menjadi gambar raster yang dapat menambah ukuran biner. Kami menyarankan untuk tetap menyimpan dokumen asli Anda.
        </div>
      )}

      <div className="result-stats">
        <span><strong>Nama File:</strong> {result.fileName}</span>
        <span>•</span>
        <span><strong>Ukuran Hasil:</strong> {formatSize(result.fileSize)}</span>
        {result.originalSize && (
          <>
            <span>•</span>
            {isEnlarged ? (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                <strong>Ukuran Bertambah:</strong> +{result.enlargedPercentage}% (dari {formatSize(result.originalSize)})
              </span>
            ) : (
              <span style={{ color: '#10b981', fontWeight: 600 }}>
                <strong>Hemat:</strong> {result.savingsPercentage}% (dari {formatSize(result.originalSize)})
              </span>
            )}
          </>
        )}
        {result.pagesCount !== undefined && (
          <>
            <span>•</span>
            <span><strong>Total Halaman:</strong> {result.pagesCount}</span>
          </>
        )}
      </div>

      <div className="result-actions">
        <a
          href={result.downloadUrl}
          download={result.fileName}
          className="btn-download"
        >
          <Download size={18} />
          <span>Unduh {result.isZip ? 'File Arsip (.ZIP)' : 'Dokumen PDF'}</span>
        </a>

        {!result.isZip && onPreview && (
          <button className="btn-secondary" onClick={onPreview}>
            <Eye size={18} />
            <span>Pratinjau Hasil</span>
          </button>
        )}

        <button className="btn-secondary" onClick={onReset}>
          <RefreshCw size={16} />
          <span>Proses File Lain</span>
        </button>
      </div>
    </div>
  );
};
