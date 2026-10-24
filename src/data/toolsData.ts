import type { ToolDefinition } from '../types';

export const TOOLS_DATA: ToolDefinition[] = [
  {
    id: 'merge',
    title: 'Gabungkan PDF (Merge)',
    shortDesc: 'Satukan beberapa file PDF menjadi satu dokumen berurutan.',
    description: 'Gabungkan dua atau lebih file PDF dengan mudah. Anda dapat menyusun urutan file dengan drag-and-drop sebelum digabungkan.',
    category: 'page-ops',
    iconName: 'Layers',
    badge: 'Paling Populer',
    accentColor: '#6366f1', // Indigo
    acceptedTypes: ['.pdf'],
    multipleFiles: true,
  },
  {
    id: 'split',
    title: 'Pisahkan PDF (Split)',
    shortDesc: 'Pecah satu file PDF menjadi beberapa dokumen atau ekstrak halaman.',
    description: 'Pisahkan PDF berdasarkan rentang halaman kustom (misal: 1-3, 4-7), interval tetap per N halaman, atau pilih halaman spesifik.',
    category: 'page-ops',
    iconName: 'Scissors',
    badge: 'Fleksibel',
    accentColor: '#ec4899', // Pink
    acceptedTypes: ['.pdf'],
    multipleFiles: false,
  },
  {
    id: 'compress',
    title: 'Kompres PDF',
    shortDesc: 'Kecilkan ukuran file PDF secara efisien langsung di browser.',
    description: 'Optimalkan ukuran file PDF agar mudah dikirim via email atau diunggah, dengan slider kontrol kualitas dan opsi grayscale.',
    category: 'convert',
    iconName: 'Minimize2',
    badge: 'Hemat Ukuran',
    accentColor: '#10b981', // Emerald
    acceptedTypes: ['.pdf'],
    multipleFiles: false,
  },
  {
    id: 'image-to-pdf',
    title: 'Gambar ke PDF',
    shortDesc: 'Ubah gambar JPG, PNG, WebP, SVG menjadi dokumen PDF rapi.',
    description: 'Konversi satu atau banyak gambar menjadi file PDF berkualitas tinggi dengan pengaturan ukuran kertas A4/Letter, orientasi, dan margin.',
    category: 'convert',
    iconName: 'Image',
    badge: 'Multi-Format',
    accentColor: '#f59e0b', // Amber
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.bmp'],
    multipleFiles: true,
  },
  {
    id: 'rotate',
    title: 'Putar Halaman (Rotate)',
    shortDesc: 'Putar orientasi halaman PDF 90°, 180°, atau 270° searah jarum jam.',
    description: 'Perbaiki orientasi halaman dokumen yang terbalik atau miring. Terapkan rotasi ke semua halaman atau hanya halaman ganjil/genap.',
    category: 'page-ops',
    iconName: 'RotateCw',
    accentColor: '#8b5cf6', // Violet
    acceptedTypes: ['.pdf'],
    multipleFiles: false,
  },
  {
    id: 'pdf-to-image',
    title: 'PDF ke Gambar',
    shortDesc: 'Ekstrak setiap halaman PDF menjadi gambar berkualitas tinggi (PNG).',
    description: 'Ubah semua halaman dokumen PDF menjadi kumpulan gambar PNG jernih siap pakai yang dikemas rapi dalam satu file arsip ZIP.',
    category: 'convert',
    iconName: 'FileImage',
    accentColor: '#06b6d4', // Cyan
    acceptedTypes: ['.pdf'],
    multipleFiles: false,
  },
  {
    id: 'viewer',
    title: 'Pratinjau Dokumen (Viewer)',
    shortDesc: 'Buka, baca, dan periksa detail halaman PDF tanpa aplikasi pihak ketiga.',
    description: 'Buka file PDF secara lokal, lihat thumbnail setiap halaman, lakukan navigasi cepat, dan periksa metadata dokumen dengan aman.',
    category: 'security',
    iconName: 'Eye',
    badge: 'Privat',
    accentColor: '#3b82f6', // Blue
    acceptedTypes: ['.pdf'],
    multipleFiles: false,
  },
];
