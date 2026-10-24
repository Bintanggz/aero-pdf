import React, { useEffect, useRef } from 'react';
import { Search, Moon, Sun, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onLogoClick,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-wrapper" onClick={onLogoClick} role="button" tabIndex={0}>
          <img src="/logo.svg" alt="AeroPDF Logo" className="brand-logo" />
          <div className="brand-text">
            <span className="brand-title">AeroPDF</span>
            <span className="brand-tagline">Client-Side PDF Studio</span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Cari fitur PDF... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Privacy Badge */}
          <div className="privacy-pill" title="Pemrosesan file 100% lokal di browser Anda. Tidak ada data yang diunggah ke server!">
            <span className="privacy-dot" />
            <ShieldCheck size={14} />
            <span>100% Privat</span>
          </div>

          {/* Theme Toggle */}
          <button
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label="Ganti mode tampilan"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
