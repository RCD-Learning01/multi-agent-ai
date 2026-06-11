import google.generativeai as genai
from app.config import config
import json
import time
import re

# Konfigurasi kunci API
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

# DEFINISI SATU MODEL UNTUK SEMUA (Gunakan gemini-2.5-flash-lite yang memiliki kuota gratis jauh lebih besar)
MODEL_NAME = "gemini-2.5-flash-lite"

def call_gemini_with_retry(model, prompt, max_retries=3):
    """Fungsi pembantu untuk memanggil Gemini dengan mekanisme retry otomatis jika terkena limit 429."""
    for attempt in range(max_retries):
        try:
            return model.generate_content(prompt)
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
Tugas: Analisis klinis/medis dari data (abaikan biaya).
Skenario: {user_prompt}
Data: {json.dumps(data_only)}
Berikan analisis singkat, tajam, & profesional (Bhs Indonesia)."""
    
    try:
        response = call_gemini_with_retry(model, prompt)
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
Berikan analisis singkat, realistis, & fokus kendala finansial (Bhs Indonesia)."""
    
    try:
        response = call_gemini_with_retry(model, prompt)
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
    
    prompt = f"""Peran: Kepala Penasihat Kebijakan Kesehatan.
Tugas: Sintesis singkat argumen Epidemiolog & Ekonom.
Skenario: {user_prompt}
Data: {json.dumps(data_only)}
Epidemiolog: {epidemiologist_notes}
Ekonom: {economist_notes}
Keluarkan output JSON: {{"synthesis": "...", "rationale": "...", "references": ["..."]}}"""
    
    try:
        response = call_gemini_with_retry(model, prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        return {"synthesis": f"Error: {str(e)}", "rationale": "Gagal.", "references": []}