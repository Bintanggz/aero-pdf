import React from 'react';
import { Sparkles, Shield, Zap, Lock, Cpu } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-pill">
        <Sparkles size={14} />
        <span>Solusi PDF Mandiri & Tanpa Server</span>
      </div>

      <h1 className="hero-title">
        Kelola Dokumen PDF dengan Cepat, <span>Aman & 100% Privat</span>
      </h1>

      <p className="hero-subtitle">
        Gabungkan, pisahkan, kompresi, dan konversi dokumen PDF Anda langsung di memori perangkat browser.
        File Anda tidak pernah dikirim ke server pihak ketiga demi kerahasiaan data maksimal.
      </p>

      <div className="hero-chips">
        <div className="hero-chip">
          <Shield size={14} style={{ color: '#10b981' }} />
          <span>Zero-Server Upload</span>
        </div>
        <div className="hero-chip">
          <Zap size={14} style={{ color: '#f59e0b' }} />
          <span>Kecepatan Instan</span>
        </div>
        <div className="hero-chip">
          <Cpu size={14} style={{ color: '#06b6d4' }} />
          <span>WebAssembly Engine</span>
        </div>
        <div className="hero-chip">
          <Lock size={14} style={{ color: '#8b5cf6' }} />
          <span>Privasi Tanpa Batas</span>
        </div>
      </div>
    </section>
  );
};
