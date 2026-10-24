import { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { ToolGrid } from './components/ToolGrid';
import { ToolWorkspace } from './components/ToolWorkspace';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ToastContainer } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { TOOLS_DATA } from './data/toolsData';
import type { ToolDefinition, ToolCategory } from './types';
import { ShieldCheck, Heart } from 'lucide-react';
import { safeRevokeUrl } from './utils/urlUtils';

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const previewCreatedUrlRef = useRef<string | null>(null);

  // Apply theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Cleanup any self-created preview URL when App unmounts
  useEffect(() => {
    return () => {
      if (previewCreatedUrlRef.current) {
        safeRevokeUrl(previewCreatedUrlRef.current);
        previewCreatedUrlRef.current = null;
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (message: string, type: 'error' | 'success' = 'error') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handlePreviewPdf = (fileOrUrl: string | File) => {
    if (previewCreatedUrlRef.current) {
      safeRevokeUrl(previewCreatedUrlRef.current);
      previewCreatedUrlRef.current = null;
    }
    if (typeof fileOrUrl === 'string') {
      setPreviewUrl(fileOrUrl);
    } else {
      const objUrl = URL.createObjectURL(fileOrUrl);
      previewCreatedUrlRef.current = objUrl;
      setPreviewUrl(objUrl);
    }
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    if (previewCreatedUrlRef.current) {
      safeRevokeUrl(previewCreatedUrlRef.current);
      previewCreatedUrlRef.current = null;
    }
  };

  // Filtered tools based on search and active category
  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchCategory = activeCategory === 'all' || tool.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.shortDesc.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div>
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogoClick={() => setSelectedTool(null)}
      />

      <main className="app-container">
        {selectedTool ? (
          /* Active Tool Workspace */
          <ToolWorkspace
            tool={selectedTool}
            onBack={() => setSelectedTool(null)}
            onPreviewPdf={handlePreviewPdf}
            onError={(msg) => addToast(msg, 'error')}
          />
        ) : (
          /* Dashboard Home */
          <>
            <Hero />

            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />

            <ToolGrid
              tools={filteredTools}
              onSelectTool={(tool) => {
                setSelectedTool(tool);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </main>

      {/* Global Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          marginTop: '60px',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={16} style={{ color: '#10b981' }} />
            <span>Semua file diproses sepenuhnya di browser pengguna tanpa transfer data ke server (Zero-Knowledge Privacy).</span>
          </div>
          <div>
            © 2026 <strong>AeroPDF Studio</strong> • Dibuat dengan <Heart size={13} style={{ display: 'inline', color: '#ec4899', verticalAlign: 'middle' }} /> menggunakan React, Vite & PDF-Lib.
          </div>
        </div>
      </footer>

      {/* PDF Modal Viewer */}
      <PdfViewerModal
        url={previewUrl}
        onClose={handleClosePreview}
      />

      {/* Toast System */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
  );
}

export default App;
