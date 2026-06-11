# Panduan Frontend (React + Vite)

Folder `frontend` ini adalah sisi *Client* atau Antarmuka Pengguna (UI) yang berjalan di browser pengguna. Proyek ini dibangun menggunakan **React.js** dan di-*bundle* menggunakan **Vite** agar proses *development* sangat cepat.

## 📂 Struktur Folder dan File

### Di dalam Folder `src/` (Folder Inti Source Code)
- **`App.jsx`**: File sentral utama di mana seluruh desain halaman, pembuatan komponen antarmuka (seperti *Slider*, *Chat Box* agen), dan logika pengiriman (*fetching*) data ke Backend berada. Di sinilah interaksi utama dibuat.
- **`App.css`**: File *styling* (CSS) khusus untuk desain dan tata letak di `App.jsx`. Warna, ukuran font, dan *glassmorphism* (efek kaca di kotak-kotak agen) diatur sepenuhnya di sini.
- **`index.css`**: File CSS global untuk mengatur konfigurasi dasar halaman web, seperti menghapus *margin* bawaan browser dan mendefinisikan *font family*.
- **`main.jsx`**: File *entry point* (titik awal) eksekusi kode React yang menempelkan keseluruhan aplikasi React Anda ke kerangka dasar di file `index.html`.
- **`assets/`**: Folder untuk menyimpan file pendukung statis. Di proyek ini terdapat subfolder `data/` yang berisi `health_payload.json` sebagai data metrik bawaan sistem (angka *default* sebelum slider digeser).

### Di luar folder `src/`
- **`index.html`**: Kerangka HTML paling utama yang dimuat pertama kali oleh browser. Nama *title* di tab browser web diubah di sini.
- **`package.json`**: Buku catatan utama Node.js yang berisi daftar semua *dependency* atau *library* eksternal (contoh: axios, lucide-react, react-markdown) serta daftar perintah skrip (seperti `npm run dev`).
- **`package-lock.json`**: File log yang otomatis dibuat oleh npm untuk mengunci versi library yang Anda pakai secara detail agar aplikasinya tidak pecah (rusak) ketika dijalankan di komputer orang lain. (Jangan diedit manual).
- **`vite.config.js`**: Konfigurasi khusus untuk program *bundler* Vite. Di sini Anda bisa mengatur *port server* atau membuat aturan plugin *build*.
- **`eslint.config.js`**: File pengaturan alat inspeksi kode (*linter*). Linter berfungsi untuk mengecek otomatis dan menggarisbawahi kode jika ada sintaks JavaScript Anda yang kurang rapi atau keliru.
- **`node_modules/`**: Folder berukuran sangat besar yang berisi hasil unduhan instalasi seluruh library dari `package.json`. Folder ini tidak dikirim ke GitHub dan tidak perlu Anda sentuh secara manual.

## 🛠️ Tips Debugging (Mencari letak Error/Bugs)
- Jika **Tampilan visual / Warna / Tata letak kotak berantakan**, cari dan perbaiki atribut CSS-nya di -> `src/App.css`
- Jika **Ada logika slider yang tidak jalan, tampilan chat eror, masalah render timer, atau *request* API gagal**, perbaiki kode di -> `src/App.jsx`
- Jika **Tiba-tiba muncul pesan *"Module not found"* saat mengetik `npm run dev`**, artinya ada library yang belum ter-download. Coba jalankan ulang perintah `npm install` di terminal.
 your project.
