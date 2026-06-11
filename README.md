# Multi-Agent Health Analyzer

Selamat datang di proyek **Multi-Agent System - Health Indicators**! 
Sistem ini menggunakan *Agentic AI* berbasis Multi-Agent untuk membantu perumusan kebijakan kesehatan masyarakat. Sistem ini dapat menganalisis berbagai indikator (seperti ekonomi, infrastruktur, dan klinis) yang dapat digeser manual, dan sistem akan memberikan simulasi analisis secara interaktif.

Sistem memecah tugas analisis AI (*Large Language Model* / LLM) menjadi tiga "persona" (*agent*) spesifik yang berjalan secara paralel (*concurrent*):
1. **Epidemiolog**: Berfokus murni pada analisis urgensi medis dan dampak penyakit klinis.
2. **Ekonom Kesehatan**: Berfokus secara eksklusif pada kapasitas finansial negara, kendala anggaran, dan dampak Produk Domestik Bruto (PDB/GDP).
3. **Kepala Penasihat**: Melakukan *synthesis* (analisis kesimpulan) dari kedua sudut pandang ahli di atas untuk merumuskan saran kebijakan final sebagai sang *Decision Maker*.

---

## 📂 Struktur Utama Proyek

Repositori ini berjenis *Monorepo* (satu repositori untuk memuat banyak layanan), yang dipecah menjadi dua bagian utama yang berdiri sendiri:

### 1. `/backend` (Otak Aplikasi & Logika AI)
- Dibangun menggunakan framework **Python** (**FastAPI**) dan **Google Gemini API**.
- Memiliki Model Machine Learning berformat **ONNX** untuk memprediksi persentase Indeks Kesehatan *(Health Index)* berdasarkan parameter input pengguna.
- Bertugas memvalidasi *request*, mengatur instruksi (*prompt engineering*) kepada AI, menembak ketiga agen AI secara serentak (paralel), lalu mengirimkan respons gabungan yang utuh kembali ke Frontend.
- 💡 *Panduan detail dan penjelasan kegunaan file backend dapat Anda baca di [backend/README.md](backend/README.md)*

### 2. `/frontend` (Wajah / Antarmuka Aplikasi)
- Dibangun menggunakan **JavaScript**, dengan framework **React.js**, dan dibungkus oleh **Vite**.
- Menampilkan antarmuka pengguna (*User Interface* / UI) modern dengan gaya *glassmorphism* dan interaksi slider dinamis.
- Bertugas menangkap data inputan skenario (*user prompt*), merakitnya (mem-*parsing*) ke JSON, menembak request ke Backend, lalu menangkap hasilnya untuk digambar (*render*) secara visual di layar browser dengan efek yang mulus.
- 💡 *Panduan detail dan penjelasan kegunaan file frontend dapat Anda baca di [frontend/README.md](frontend/README.md)*

### 3. File Bebas di Luar (Global File / Root)
- **`.gitignore`**: Dokumen aturan untuk memberi tahu Git (dan GitHub) daftar file atau folder apa saja yang **harus diabaikan** agar tidak ikut ter-upload. (Sangat berguna untuk mencegah folder sampah seperti `node_modules` atau `venv` membebani *repository*).
- **`.gitattributes`**: Pengaturan sistem internal Git untuk menangani masalah konversi spasi dan *enter* (*Line Endings* seperti CRLF/LF) agar kode tidak rusak ketika dibuka silang platform (misalnya dari Windows dikirim ke MacBook).
- **`.vscode/`**: Folder khusus yang isinya pengaturan (konfigurasi) *Workspace*. Fungsinya memaksa teks editor seperti Visual Studio Code (atau Antigravity IDE) agar langsung mengenali *Virtual Environment* Python tanpa perlu dicari secara manual.
- **`README.md`**: File informasi utama (yang sedang Anda baca saat ini) yang berfungsi sebagai dokumentasi muka proyek.

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal (*Local Development*)

Dikarenakan arsitektur proyek ini terpisah, Anda memerlukan **dua jendela terminal** (CMD/PowerShell) yang terpisah untuk menjalankan aplikasi ini.

### Langkah 1: Menyalakan Server Backend (Terminal 1)
```bash
# Masuk ke folder backend
cd backend

# Aktifkan virtual environment Python (Perintah khusus OS Windows)
.\venv\Scripts\activate

# Jalankan server backend dengan fitur auto-reload
uvicorn app.main:app --reload
```
Server Backend akan standby dan berjalan di alamat lokal: **http://localhost:8000**

### Langkah 2: Menyalakan Server Frontend (Terminal 2)
```bash
# Buka terminal baru dan masuk ke folder frontend
cd frontend

# Jalankan server pengembangan React (Vite)
npm run dev
```
*(Catatan: Anda tidak perlu menjalankan `npm install` lagi kecuali Anda menghapus folder `node_modules` atau menambah library baru).*

Server Frontend visual akan berjalan di: **http://localhost:5173** (Buka tautan ini di browser Chrome/Edge/Firefox Anda untuk memainkan aplikasinya!).

---

## 🛠️ Alur Komunikasi Sistem (*Data Flow*)
Bagaimana sebenarnya sistem ini bekerja saat Anda menekan tombol?
1. Pengguna memanipulasi *slider* metrik di **Frontend** dan mengetik instruksi kendala spesifik.
2. **Frontend** mengambil semua angka tersebut, merangkumnya jadi bentuk JSON rapi (disebut *payload*), lalu menembak HTTP POST *Request* ke alamat **Backend** (`http://localhost:8000/api/analyze`).
3. Di dalam **Backend**, operasi paralel dimulai:
   - Fitur *machine learning* (ONNX Model) menghitung hasil prediksi tingkat akurasinya.
   - Bersamaan dengan itu, *payload* disebar (*concurrent task*) ke API Gemini untuk menghidupkan Agen Epidemiolog dan Agen Ekonom.
   - Setelah kedua agen selesai berfikir, argumen mereka diserahkan ke Kepala Penasihat.
4. **Backend** membungkus rapi semua balasan tersebut (termasuk *stopwatch timer*) menjadi satu buah keranjang JSON final.
5. **Frontend** menangkap *response* keranjang JSON itu, memecahnya ke kotak-kotak komponen masing-masing, dan menampilkannya (*render*) secara visual di layar Anda.