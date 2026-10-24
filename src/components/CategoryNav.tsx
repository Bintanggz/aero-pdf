import React from 'react';
import type { ToolCategory } from '../types';

interface CategoryNavProps {
  activeCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
}

const CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: 'all', label: 'Semua Fitur' },
  { id: 'page-ops', label: 'Operasi Halaman' },
  { id: 'convert', label: 'Optimasi & Konversi' },
  { id: 'security', label: 'Keamanan & Pratinjau' },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <nav className="category-nav" aria-label="Kategori Tools">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
};
