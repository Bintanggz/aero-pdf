import React from 'react';
import { ArrowLeft, Layers, Scissors, Minimize2, Image as ImageIcon, RotateCw, FileImage, Eye } from 'lucide-react';
import type { ToolDefinition } from '../types';
import { MergeTool } from './tools/MergeTool';
import { SplitTool } from './tools/SplitTool';
import { CompressTool } from './tools/CompressTool';
import { ImageToPdfTool } from './tools/ImageToPdfTool';
import { RotateTool } from './tools/RotateTool';
import { PdfToImageTool } from './tools/PdfToImageTool';
import { ViewerTool } from './tools/ViewerTool';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
  onPreviewPdf: (fileOrUrl: string | File) => void;
  onError: (msg: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  Layers,
  Scissors,
  Minimize2,
  Image: ImageIcon,
  RotateCw,
  FileImage,
  Eye,
};

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  onBack,
  onPreviewPdf,
  onError,
}) => {
  const IconComponent = ICON_MAP[tool.iconName] || Layers;

  const renderActiveTool = () => {
    switch (tool.id) {
      case 'merge':
        return <MergeTool onPreviewPdf={onPreviewPdf} onError={onError} />;
      case 'split':
        return <SplitTool onPreviewPdf={onPreviewPdf} onError={onError} />;
      case 'compress':
        return <CompressTool onPreviewPdf={onPreviewPdf} onError={onError} />;
      case 'image-to-pdf':
        return <ImageToPdfTool onPreviewPdf={onPreviewPdf} onError={onError} />;
      case 'rotate':
        return <RotateTool onPreviewPdf={onPreviewPdf} onError={onError} />;
      case 'pdf-to-image':
        return <PdfToImageTool onPreviewPdf={onPreviewPdf} onError={onError} />;
      case 'viewer':
        return <ViewerTool onError={onError} />;
      default:
        return <div>Fitur belum tersedia.</div>;
    }
  };

  return (
    <div className="workspace-container">
      {/* Top Bar with Back Button */}
      <div className="workspace-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Kembali ke Semua Fitur</span>
        </button>

        {tool.badge && <span className="tool-badge">{tool.badge}</span>}
      </div>

      {/* Tool Meta Info */}
      <div className="workspace-meta">
        <div
          className="workspace-icon"
          style={{
            background: `${tool.accentColor}18`,
            color: tool.accentColor,
          }}
        >
          <IconComponent size={28} />
        </div>
        <div className="workspace-title-box">
          <h1>{tool.title}</h1>
          <p>{tool.description}</p>
        </div>
      </div>

      {/* Tool Component */}
      {renderActiveTool()}
    </div>
  );
};
