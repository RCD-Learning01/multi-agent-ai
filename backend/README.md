# Panduan Backend (FastAPI + AI Agents)

Folder `backend` ini berisi semua *source code* (kode sumber) yang berjalan di sisi server. Backend ini menggunakan framework **FastAPI** (Python) dan menghubungkan logika Machine Learning (ONNX) dengan Multi-Agent System (AI).

## 📂 Struktur Folder dan File

### Di dalam folder `app/` (Folder Inti Aplikasi)
- **`__init__.py`**: File kosong yang menandakan bahwa folder `app` ini adalah sebuah modul atau *package* Python.
- **`main.py`**: File utama (*entry point*). Di sinilah server FastAPI dibuat, rute URL/API didefinisikan (contoh: `/api/analyze`), dan di sini juga agen-agen AI dijalankan secara paralel (bersamaan).
- **`agents.py`**: Berisi logika untuk mengatur *prompt* dan memanggil model AI (Google Gemini). Di sini terdapat fungsi untuk Agen Epidemiolog, Agen Ekonom Kesehatan, dan Agen Kepala Penasihat.
- **`config.py`**: File untuk mengatur konfigurasi dasar, seperti memuat rahasia *API Key* dari file `.env`.
- **`ml_model.py`**: Skrip Python yang bertugas untuk memuat model *Machine Learning* berekstensi `.onnx` dan melakukan fungsi prediksi (*inference*).
- **`model.onnx`**: Model *Machine Learning* yang sudah di-training (dalam format file biner ONNX) untuk memprediksi *Health Index* (Indeks Kesehatan).
- **`schemas.py`**: Berisi definisi *data validation* (validasi data) menggunakan library Pydantic. Ini memastikan bahwa struktur JSON yang dikirim oleh Frontend formatnya sudah sesuai dan tidak ada data yang salah tipe.

### Di luar folder `app/`
- **`.env`** & **`.env.example`**: File untuk menyimpan variabel rahasia yang tidak boleh bocor, contohnya `GEMINI_API_KEY`.
- **`requirements.txt`**: Daftar *dependency* atau *library* Python yang dibutuhkan proyek ini (seperti fastapi, uvicorn, onnxruntime, google-generativeai, dll).
- **`Dockerfile`**: Resep untuk membungkus aplikasi ini ke dalam *container* (Docker) agar mudah di-deploy (di-hosting) di server sungguhan.
- **`test_models.py`** & **`test_quotas.py`**: Skrip *testing* (pengujian) sementara yang biasa digunakan *developer* untuk mengecek secara cepat apakah model AI atau kuota API berjalan normal tanpa perlu menjalankan server web.
- **`venv/`**: (*Virtual Environment*) Folder sistem yang menyimpan semua library Python yang diinstall dari `requirements.txt`. (Biasanya folder ini sangat berat dan tidak perlu diedit manual).

## 🛠️ Tips Debugging (Mencari letak Error/Bugs)
- Jika ada masalah pada **Logika Jawaban AI atau Prompt**, cek -> `app/agents.py`
- Jika ada masalah pada **Data yang dikirim/diterima (Error 422 Unprocessable Entity)**, cek -> `app/schemas.py`
- Jika ada masalah pada **Prediksi persentase (ONNX Model)**, cek -> `app/ml_model.py`
- Jika **API Error 500 / Tidak tersambung / Fitur Timer eksekusi rusak**, cek -> `app/main.py`
