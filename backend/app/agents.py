import google.generativeai as genai # pyrefly: ignore [missing-import]
from app.config import config
import json
import time
import re

# Konfigurasi kunci API
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

# DEFINISI SATU MODEL UNTUK SEMUA (Gunakan gemini-flash-lite-latest yang memiliki kuota gratis)
MODEL_NAME = "gemini-flash-lite-latest"

def call_gemini_with_retry(model, prompt, max_retries=3, max_tokens=250):
    """Fungsi pembantu untuk memanggil Gemini dengan mekanisme retry otomatis jika terkena limit 429."""
    for attempt in range(max_retries):
        try:
            return model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(max_output_tokens=max_tokens)
            )
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg and "Quota exceeded" in error_msg:
                # Cari tahu berapa detik kita harus menunggu dari pesan error
                delay = 30 # Default tunggu 30 detik
                match = re.search(r"Please retry in (\d+\.?\d*)s", error_msg)
                if match:
                    delay = float(match.group(1)) + 1.0 # Tambah 1 detik sebagai buffer
                
                if attempt < max_retries - 1:
                    print(f"[Warning] Terkena limit API (429). Menunggu {delay:.1f} detik sebelum mencoba lagi...")
                    time.sleep(delay)
                    continue
            raise e

def run_epidemiologist_agent(payload: dict) -> str:
    if not config.GEMINI_API_KEY:
        return "Epidemiologist Agent: GEMINI_API_KEY is missing."
        
    model = genai.GenerativeModel(MODEL_NAME)
    user_prompt = payload.get("user_prompt", "")
    
    # Filter payload agar history dan prompt tidak ikut ter-dump
    data_only = {k: v for k, v in payload.items() if k not in ['chat_history', 'user_prompt']}
    
    prompt = f"""Peran: Epidemiolog Medis.
Tugas: Analisis klinis/medis (abaikan biaya).
Skenario: {user_prompt}
Data: {json.dumps(data_only)}
Berikan analisis SANGAT SINGKAT, maksimal 2-3 kalimat saja (Bhs Indonesia)."""
    
    try:
        response = call_gemini_with_retry(model, prompt, max_tokens=150)
        return response.text
    except Exception as e:
        return f"Error running Epidemiologist Agent: {str(e)}"

def run_economist_agent(payload: dict) -> str:
    if not config.GEMINI_API_KEY:
        return "Health Economist Agent: GEMINI_API_KEY is missing."
        
    # SUDAH DIUBAH KE MODEL_NAME
    model = genai.GenerativeModel(MODEL_NAME)
    user_prompt = payload.get("user_prompt", "")
        
    # Filter payload agar history dan prompt tidak ikut ter-dump
    data_only = {k: v for k, v in payload.items() if k not in ['chat_history', 'user_prompt']}
    
    prompt = f"""Peran: Ekonom Kesehatan.
Tugas: Analisis kapasitas finansial negara.
Skenario: {user_prompt}
Data: {json.dumps(data_only)}
Berikan analisis SANGAT SINGKAT, maksimal 2-3 kalimat saja (Bhs Indonesia)."""
    
    try:
        response = call_gemini_with_retry(model, prompt, max_tokens=150)
        return response.text
    except Exception as e:
        return f"Error running Health Economist Agent: {str(e)}"

def run_chief_advisor_agent(payload: dict, epidemiologist_notes: str, economist_notes: str) -> dict:
    if not config.GEMINI_API_KEY:
        return {"synthesis": "Error: GEMINI_API_KEY is missing.", "rationale": "Missing API Key", "references": []}
        
    # SUDAH DIUBAH KE MODEL_NAME
    model = genai.GenerativeModel(MODEL_NAME)
    user_prompt = payload.get("user_prompt", "")
    
    # Filter payload agar history dan prompt tidak ikut ter-dump
    data_only = {k: v for k, v in payload.items() if k not in ['chat_history', 'user_prompt']}
    
    # Extract the predicted risk status for explicit prompting
    ml_risk_status = payload.get("predicted_health_risk_status", "Tidak Diketahui")
    
    prompt = f"""Peran: Kepala Penasihat Kebijakan Kesehatan.
Tugas: Sintesis SANGAT SINGKAT argumen Epidemiolog & Ekonom.
Skenario: {user_prompt}
Data: {json.dumps(data_only)}
Prediksi Model ML Objektif: Tingkat kesehatan berada pada '{ml_risk_status}'
Epidemiolog: {epidemiologist_notes}
Ekonom: {economist_notes}
Keluarkan JSON: {{"synthesis": "Singkat max 2 kalimat", "rationale": "Singkat 1 kalimat", "references": ["URL singkat"]}}"""
    
    try:
        response = call_gemini_with_retry(model, prompt, max_tokens=300)
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        return {"synthesis": f"Error: {str(e)}", "rationale": "Gagal.", "references": []}