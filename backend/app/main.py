# Di dalam backend/app/main.py
from fastapi import FastAPI
from app.schemas import HealthDataPayload  # Memanggil struktur data dari schemas.py

app = FastAPI()

@app.post("/api/analyze")
async def analyze_health_data(payload: HealthDataPayload):
    # Sekarang data JSON otomatis tervalidasi dan siap dilempar ke model ONNX & Agen AI
    data_ekonomi = payload.economic_indicators
    jumlah_data = payload.metadata.total_records
    
    return {"status": "success", "processed_records": jumlah_data}