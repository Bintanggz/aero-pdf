import React from 'react';
import type { ToolDefinition } from '../types';
import { 
  Layers, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon, 
  RotateCw, 
  FileImage, 
  Eye, 
  ArrowRight 
} from 'lucide-react';

interface ToolGridProps {
  tools: ToolDefinition[];
  onSelectTool: (tool: ToolDefinition) => void;
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

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, onSelectTool }) => {
  if (tools.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tidak ada fitur yang cocok dengan pencarian Anda.</p>
        <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Coba kata kunci lain atau pilih kategori Semua Fitur.</p>
      </div>
    );
  }

  return (
    <div className="tools-grid">
      {tools.map((tool) => {
        const IconComponent = ICON_MAP[tool.iconName] || Layers;

        return (
          <div
            key={tool.id}
            className="tool-card"
            style={{ '--card-accent': tool.accentColor } as React.CSSProperties}
            onClick={() => onSelectTool(tool)}
            role="button"
            tabIndex={0}
          >
            <div className="tool-card-header">
              <div className="tool-icon-box">
                <IconComponent size={24} />
              </div>
              {tool.badge && <span className="tool-badge">{tool.badge}</span>}
            </div>

            <h3 className="tool-title">{tool.title}</h3>
            <p className="tool-desc">{tool.shortDesc}</p>

            <div className="tool-card-footer">
              <span>Mulai Sekarang</span>
              <div className="tool-action-arrow">
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
