export type ToolId = 
  | 'merge' 
  | 'split' 
  | 'compress' 
  | 'image-to-pdf' 
  | 'rotate' 
  | 'pdf-to-image'
  | 'viewer';

export type ToolCategory = 'all' | 'page-ops' | 'convert' | 'security';

export interface ToolDefinition {
  id: ToolId;
  title: string;
  shortDesc: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  accentColor: string;
  acceptedTypes: string[]; // e.g. ['.pdf'] or ['.jpg', '.png', '.webp']
  multipleFiles: boolean;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  thumbnailUrl?: string;
  status: 'pending' | 'ready' | 'processing' | 'error';
  error?: string;
}

export interface ProcessProgress {
  percentage: number;
  statusText: string;
  step?: number;
  totalSteps?: number;
}

export interface MergeOptions {
  generateToc: boolean;
  stripSignatures: boolean;
}

export type SplitMode = 'range' | 'interval' | 'selected';

export interface SplitOptions {
  mode: SplitMode;
  rangeString: string; // e.g. "1-3, 4-7"
  interval: number; // e.g. 1
  selectedPages: number[]; // 1-indexed page numbers
}

export interface CompressOptions {
  quality: number; // 1 to 9 (5 recommended)
  grayscale: boolean;
  targetReductionPercent?: number;
}

export type PageSizeOption = 'A4' | 'Letter' | 'fit';
export type PageOrientationOption = 'auto' | 'portrait' | 'landscape';
export type MarginOption = 'none' | 'small' | 'large';

export interface ImageToPdfOptions {
  pageSize: PageSizeOption;
  orientation: PageOrientationOption;
  margin: MarginOption;
  fitMode: 'contain' | 'cover';
}

export interface RotateOptions {
  angle: 90 | 180 | 270;
  applyTo: 'all' | 'odd' | 'even' | 'selected';
  selectedPages?: number[];
}

export interface ProcessResult {
  blob: Blob;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  isZip?: boolean;
  originalSize?: number;
  pagesCount?: number;
  savingsPercentage?: number;
  isEnlarged?: boolean;
  enlargedPercentage?: number;
}
