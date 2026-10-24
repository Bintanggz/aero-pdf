<div align="center">

# 📄 AeroPDF

**Toolkit manipulasi PDF all-in-one yang cepat, modern, dan 100% privat langsung di peramban Anda.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.3-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10b981.svg)](#-mengapa-aeropdf)

[🚀 Jelajahi Fitur](#-fitur-utama) • [💻 Panduan Instalasi](#-memulai-secara-lokal) • [🤝 Panduan Kontribusi](#-berkontribusi) • [🛣️ Roadmap](#-roadmap)

---

</div>

## 🌟 Mengapa AeroPDF?

Banyak situs web konverter PDF di internet mengharuskan Anda mengunggah dokumen pribadi atau sensitif ke server mereka. **AeroPDF berbeda:**

- 🔒 **100% Client-Side Privacy**: Dokumen Anda **TIDAK PERNAH** dikirim atau disimpan di server mana pun. Seluruh operasi manipulasi PDF berjalan langsung di memori browser lokal Anda.
- ⚡ **Performa Sangat Cepat**: Menggunakan pustaka tingkat rendah `pdf-lib` dan rendering `pdfjs-dist` dengan Canvas untuk hasil instan tanpa antrean server.
- 🎨 **Antarmuka Modern & Responsif**: Didesain dengan estetika modern, micro-interactions halus, drag-and-drop intuitif, dan dukungan tampilan mobile/desktop.
- 🆓 **Bebas Selamanya & Open Source**: Tanpa kuota harian, tanpa watermark tersembunyi, dan tanpa paywall.

---

## 🛠️ Fitur Utama

| Fitur | Deskripsi | Status |
| :--- | :--- | :---: |
| **📑 Merge PDF** | Gabungkan beberapa file PDF menjadi satu file utuh dengan fitur drag & drop urutan halaman. | ✅ Siap |
| **✂️ Split & Extract PDF** | Pisahkan file PDF berdasarkan rentang halaman (*range*), pisahkan per halaman, atau ekstrak halaman pilihan. | ✅ Siap |
| **🗜️ Compress PDF** | Kurangi ukuran file PDF dengan kompresi cerdas tanpa mengorbankan kualitas dokumen penting. | ✅ Siap |
| **🔄 Rotate PDF** | Putar halaman PDF secara perorangan atau sekaligus (90°, 180°, 270°). | ✅ Siap |
| **🖼️ Image to PDF** | Konversi kumpulan gambar (JPG, PNG, WebP) menjadi satu file PDF berkualitas tinggi. | ✅ Siap |
| **📸 PDF to Image** | Konversi tiap halaman PDF menjadi gambar resolusi tinggi (PNG/JPG) yang diunduh otomatis dalam format ZIP. | ✅ Siap |
| **👁️ Built-in PDF Viewer** | Pratinjau dokumen PDF secara instan di dalam aplikasi dengan kontrol zoom dan navigasi halaman. | ✅ Siap |

---

## 🏗️ Struktur Proyek

```text
pdf-toolkit/
├── .github/                 # GitHub workflows (CI) & issue/PR templates
├── public/                  # Aset statis & logo
├── src/
│   ├── assets/              # Gambar dan ikon lokal
│   ├── components/          # Komponen UI umum (Header, Hero, DropZone, dll)
│   │   └── tools/           # Implementasi modul tiap tool PDF
│   │       ├── MergeTool.tsx
│   │       ├── SplitTool.tsx
│   │       ├── CompressTool.tsx
│   │       ├── RotateTool.tsx
│   │       ├── ImageToPdfTool.tsx
│   │       ├── PdfToImageTool.tsx
│   │       └── ViewerTool.tsx
│   ├── data/                # Data konfigurasi tools & metadata
│   ├── services/            # Logika pemrosesan file (thumbnail, dll)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Fungsi utilitas & kalkulasi
│   ├── App.tsx              # Komponen utama aplikasi
│   ├── index.css            # Desain sistem & styling styling CSS
│   └── main.tsx             # Entry point React
├── package.json             # Konfigurasi dependensi & scripts
├── tsconfig.json            # Konfigurasi TypeScript
└── vite.config.ts           # Konfigurasi bundler Vite
```

---

## 💻 Memulai Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek AeroPDF di komputer Anda:

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau yang lebih baru
- Package manager `npm` (atau `pnpm` / `yarn`)

### Langkah Instalasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/Bintanggz/aero-pdf.git
   cd aero-pdf
   ```

2. **Pasang dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka peramban dan akses alamat `http://localhost:5173`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```
   Hasil bundle produksi akan tersedia di direktori `dist/`.

5. **Linting kode**:
   ```bash
   npm run lint
   ```

---

## 🤝 Berkontribusi

Kami sangat menyambut kontribusi dari komunitas! Baik itu berupa:
- 🐛 Melaporkan bug
- 💡 Mengusulkan fitur baru
- 📝 Memperbaiki atau memperjelas dokumentasi
- 💻 Menulis kode atau mengoptimalkan algoritma manipulasi PDF

Silakan baca **[CONTRIBUTING.md](CONTRIBUTING.md)** untuk panduan alur kerja Git, konvensi commit, dan standar kode yang berlaku di proyek ini.

---

## 🛣️ Roadmap Masa Depan

- [ ] Proteksi & Pembuka Kunci PDF (Password Protect & Unlock)
- [ ] Penambahan Tanda Air (Watermark) Teks & Gambar
- [ ] Pengurutan halaman visual interaktif (*interactive reorder canvas*)
- [ ] Dukungan PWA (Progressive Web App) agar dapat digunakan secara offline
- [ ] Tanda Tangan Digital (Digital Signatures / Draw Sign)

Ingin menggarap salah satu fitur di atas? Buka issue atau langsung ajukan Pull Request!

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah **[MIT License](LICENSE)**. Anda bebas menggunakan, memodifikasi, dan mendistribusikan kode ini untuk tujuan pribadi maupun komersial.

Dibuat dengan ❤️ oleh [Bintang](https://github.com/Bintanggz).
