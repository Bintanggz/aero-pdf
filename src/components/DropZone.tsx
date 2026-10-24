import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import type { UploadedFileItem } from '../types';
import { getPdfInfoAndThumbnail, getImageThumbnail } from '../services/thumbnailService';

interface DropZoneProps {
  files: UploadedFileItem[];
  onFilesChange: (files: UploadedFileItem[]) => void;
  acceptedTypes: string[];
  multiple: boolean;
  title?: string;
  description?: string;
  onError?: (msg: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  files,
  onFilesChange,
  acceptedTypes,
  multiple,
  title = 'Tarik & Jatuhkan File ke Sini',
  description = 'atau klik tombol di bawah untuk memilih file dari komputer Anda',
  onError,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size to KB/MB
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processNewFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    const validFiles: File[] = [];

    for (const f of rawFiles) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some((t) => t.toLowerCase() === ext || t === '*');
      if (isAccepted) {
        validFiles.push(f);
      } else {
        onError?.(`File "${f.name}" tidak didukung. Format yang diterima: ${acceptedTypes.join(', ')}`);
      }
    }

    if (validFiles.length === 0) return;

    const filesToTake = multiple ? validFiles : [validFiles[0]];
    const newItems: UploadedFileItem[] = [];

    for (const file of filesToTake) {
      const id = `${file.name}_${file.size}_${Date.now()}_${Math.random()}`;
      const item: UploadedFileItem = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
      };

      newItems.push(item);
    }

    const updatedList = multiple ? [...files, ...newItems] : newItems;
    onFilesChange(updatedList);

    // Asynchronously generate thumbnails & page counts
    for (const item of newItems) {
      if (item.file.name.toLowerCase().endsWith('.pdf')) {
        getPdfInfoAndThumbnail(item.file).then(({ pageCount, thumbnailUrl }) => {
          onFilesChange(
            updatedList.map((f) =>
              f.id === item.id
                ? { ...f, pageCount, thumbnailUrl, status: 'ready' }
                : f
            )
          );
        });
      } else {
        // Image file
        getImageThumbnail(item.file).then((thumbnailUrl) => {
          onFilesChange(
            updatedList.map((f) =>
              f.id === item.id
                ? { ...f, thumbnailUrl, pageCount: 1, status: 'ready' }
                : f
            )
          );
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer?.files) {
      processNewFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processNewFiles(e.target.files);
    }
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...files];
    const temp = newArr[index];
    newArr[index] = newArr[index - 1];
    newArr[index - 1] = temp;
    onFilesChange(newArr);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newArr = [...files];
    const temp = newArr[index];
    newArr[index] = newArr[index + 1];
    newArr[index + 1] = temp;
    onFilesChange(newArr);
  };

  return (
    <div>
      {/* Drop Area */}
      <div
        className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        <div className="dropzone-icon">
          <UploadCloud size={30} />
        </div>

        <h3 className="dropzone-title">{title}</h3>
        <p className="dropzone-desc">{description}</p>

        <button
          type="button"
          className="dropzone-btn"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {multiple ? <Plus size={16} /> : <FileText size={16} />}
          <span>{files.length > 0 && multiple ? 'Tambah File Tambahan' : 'Pilih File Dokumen'}</span>
        </button>

        <div className="dropzone-types">
          Format didukung: {acceptedTypes.join(', ')} • Maksimal 100 MB per file
        </div>
      </div>

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((item, idx) => (
            <div key={item.id} className="file-item-card">
              {/* Thumbnail / Icon */}
              <div className="file-thumb-preview">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.name} />
                ) : (
                  <FileText size={24} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              {/* Info */}
              <div className="file-details">
                <div className="file-name" title={item.name}>
                  {idx + 1}. {item.name}
                </div>
                <div className="file-subtext">
                  <span>{formatSize(item.size)}</span>
                  {item.pageCount !== undefined && (
                    <span>• {item.pageCount} Halaman</span>
                  )}
                </div>
              </div>

              {/* Reordering & Delete Actions */}
              <div className="file-actions">
                {multiple && files.length > 1 && (
                  <>
                    <button
                      className="action-icon-btn"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      title="Pindahkan ke atas"
                      aria-label="Pindahkan ke atas"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="action-icon-btn"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === files.length - 1}
                      title="Pindahkan ke bawah"
                      aria-label="Pindahkan ke bawah"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </>
                )}

                <button
                  className="action-icon-btn delete"
                  onClick={() => handleRemoveFile(item.id)}
                  title="Hapus file"
                  aria-label="Hapus file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
