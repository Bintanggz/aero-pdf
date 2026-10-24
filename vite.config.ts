import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pdf-lib')) return 'vendor-pdf-lib';
          if (id.includes('pdfjs-dist')) return 'vendor-pdfjs';
          if (id.includes('jszip')) return 'vendor-jszip';
          if (id.includes('lucide-react')) return 'vendor-icons';
        },
      },
    },
  },
})
