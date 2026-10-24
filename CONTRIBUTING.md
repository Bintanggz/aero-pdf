# 🤝 Panduan Berkontribusi untuk AeroPDF

Terima kasih atas minat Anda untuk berkontribusi pada **AeroPDF**! Proyek ini terbuka bagi siapa saja yang ingin belajar, memperbaiki bug, maupun menambahkan fitur baru.

---

## 🧭 Prinsip Utama Proyek
Sebelum berkontribusi, harap diingat pilar utama AeroPDF:
1. **100% Client-Side Privacy**: Tidak boleh ada operasi manipulasi file yang mengirimkan dokumen ke server eksternal. Semua proses harus berjalan lokal di browser pengguna (`pdf-lib`, `pdfjs-dist`, `canvas`, dll).
2. **Kinerja & Responsivitas**: Hindari blocking UI thread saat memproses file berukuran besar. Gunakan asynchronous pattern, web workers, atau chunking jika diperlukan.
3. **Estetika & Kemudahan Penggunaan**: Antarmuka harus rapi, intuitif, dan responsif di semua ukuran layar.

---

## 🚀 Alur Kerja Kontribusi (Git Workflow)

Ikuti langkah-langkah standar berikut untuk mengajukan perubahan kode:

### 1. Fork & Clone
1. Fork repositori ini ke akun GitHub Anda dengan mengklik tombol **Fork** di pojok kanan atas halaman repositori.
2. Clone fork Anda ke komputer lokal:
   ```bash
   git clone https://github.com/<username-anda>/aero-pdf.git
   cd aero-pdf
   ```
3. Tambahkan repositori utama sebagai `upstream`:
   ```bash
   git remote add upstream https://github.com/Bintanggz/aero-pdf.git
   ```

### 2. Buat Branch Baru
Selalu buat branch baru untuk setiap fitur atau perbaikan bug yang terpisah dari branch `main`:
```bash
# Untuk fitur baru:
git checkout -b feat/nama-fitur-baru

# Untuk perbaikan bug:
git checkout -b fix/deskripsi-singkat-bug
```

### 3. Jalankan Lingkungan Pengembangan
1. Pasang paket dependensi:
   ```bash
   npm install
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```

### 4. Konvensi Commit
Gunakan format [Conventional Commits](https://www.conventionalcommits.org/) agar riwayat commit rapi dan mudah dibaca:
- `feat:` Menambahkan fitur baru (contoh: `feat: add pdf page reordering`)
- `fix:` Memperbaiki bug (contoh: `fix: handle corrupted pdf files gracefully`)
- `docs:` Perubahan dokumentasi (contoh: `docs: update installation steps in README`)
- `style:` Perbaikan formatting tanpa mengubah logika kode
- `refactor:` Restrukturisasi kode tanpa mengubah fungsionalitas
- `perf:` Optimasi performa

Contoh:
```bash
git commit -m "feat(compress): add slider to choose compression quality"
```

### 5. Verifikasi Kode Sebelum Push
Sebelum membuat Pull Request, pastikan kode Anda lolos pemeriksaan tipe data dan linter:
```bash
# 1. Jalankan linter
npm run lint

# 2. Pastikan build TypeScript berhasil tanpa error
npm run build
```

### 6. Ajukan Pull Request (PR)
1. Push branch Anda ke GitHub fork:
   ```bash
   git push origin feat/nama-fitur-baru
   ```
2. Buka repositori Anda di browser GitHub dan klik **Compare & pull request**.
3. Isi deskripsi PR dengan jelas sesuai template yang disediakan (jelaskan apa yang diubah, mengapa, dan sertakan screenshot jika mengubah tampilan UI).
4. Tunggu review dari maintainer. Kami mungkin memberikan feedback atau saran perbaikan sebelum menggabungkan (*merge*) kode Anda.

---

## 🛠️ Standar Penulisan Kode

- **TypeScript**: Gunakan tipe data eksplisit pada parameter fungsi dan state. Hindari penggunaan tipe `any`.
- **React**: Gunakan Functional Component dengan React Hooks modern.
- **Styling**: Ikuti sistem token dan kelas yang ada di `src/index.css`. Jaga konsistensi tema warna, spasi, dan radius sudut (*border-radius*).
- **Error Handling**: Selalu sertakan penanganan error yang ramah pengguna menggunakan komponen `Toast` atau notifikasi visual jika terjadi kegagalan pembacaan file PDF.

---

## ❓ Butuh Bantuan atau Ingin Bertanya?

Jika Anda memiliki pertanyaan seputar arsitektur kode atau ingin mendiskusikan ide fitur sebelum mulai coding, silakan buka **Issue** baru atau manfaatkan fitur **GitHub Discussions** pada repositori ini.

Selamat berkarya dan selamat bergabung dalam komunitas open source! 🚀
