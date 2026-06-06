# Multi-Agent System - Health Indicators

Sistem Agentic AI berbasis Multi-Agent untuk merumuskan kebijakan kesehatan masyarakat dengan menganalisis 48 indikator (Ekonomi, Infrastruktur, dan Klinis). 

Sistem ini memecah tugas LLM menjadi tiga persona agen:
1. **Epidemiolog**: Analisis urgensi medis.
2. **Ekonom Kesehatan**: Analisis kapasitas finansial dan batasan realistis.
3. **Kepala Penasihat**: Pengambil keputusan akhir dan sintesis kebijakan.

## 🛠️ Teknologi yang Digunakan
- **Backend**: FastAPI, Uvicorn, ONNX Runtime (Python)
- **Frontend**: Node.js (React / Vue)
- **AI / LLM**: Google Gemini API

## 📂 Struktur Proyek
- `/backend`: Berisi logika Machine Learning (ONNX) dan Multi-Agent System.
- `/frontend`: Berisi antarmuka pengguna interaktif.

## 🚀 Cara Menjalankan Backend (Development)
1. Masuk ke folder backend: `cd backend`
2. Install dependency: `pip install -r requirements.txt`
3. Jalankan server: `uvicorn app.main:app --reload`