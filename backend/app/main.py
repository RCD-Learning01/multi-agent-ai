from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import HealthDataPayload
from app.ml_model import HealthONNXModel
from app.agents import run_epidemiologist_agent, run_economist_agent, run_chief_advisor_agent

import os
import asyncio
import time
from dotenv import load_dotenv # pyrefly: ignore [missing-import]
import google.generativeai as genai # pyrefly: ignore [missing-import]

load_dotenv() # Membaca file .env
genai.configure(api_key=os.getenv("GEMINI_API_KEY")) # Memasang kunci API
# --------------------------

app = FastAPI(title="Multi-Agent Health Analyzer API")

# Configure CORS so that frontend (Vite/React at http://localhost:5173) can access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can restrict to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ONNX Model
model = HealthONNXModel()

async def measure_time(func, *args):
    start_time = time.time()
    result = await asyncio.to_thread(func, *args)
    duration = time.time() - start_time
    time_str = f"{int(duration // 60)}m {duration % 60:.1f}s"
    return result, time_str

@app.get("/")
async def root():
    return {"message": "Selamat datang di API Multi-Agent Health Analyzer. Server Backend berjalan lancar!"}

@app.post("/api/analyze")
async def analyze_health_data(payload: HealthDataPayload):
    # Convert payload into python dict
    payload_dict = payload.model_dump()
    
    # 1. Run ONNX Model Inference
    # Create the feature vector with exactly 4 features expected by the LSTM model
    feature_vector = [
        payload.economic_indicators.gdp_per_capita,
        payload.economic_indicators.health_expenditure_pct,
        payload.infrastructure_indicators.clean_water_access_pct,
        payload.clinical_indicators.immunization_rate_pct
    ]
    
    # Run prediction
    predicted_risk_class, confidence_score = model.predict(feature_vector)
    
    # Map predicted class to text label (0: Rendah, 1: Sedang, 2: Tinggi)
    risk_labels = {0: "Risiko Rendah", 1: "Risiko Sedang", 2: "Risiko Tinggi"}
    health_risk_status = risk_labels.get(predicted_risk_class, "Risiko Sedang")
    
    # Inject health risk status into the payload for the AI agents to read
    payload_dict["predicted_health_risk_status"] = health_risk_status
    
    # 2 & 3. Run Epidemiologist Agent & Health Economist Agent Sequentially
    # Menjalankan agen secara berurutan dengan jeda agar tidak terkena limit API 429 (Burst Limits)
    epidemiologist_notes, epi_time = await measure_time(run_epidemiologist_agent, payload_dict)
    await asyncio.sleep(2) # Memberi sedikit jeda nafas pada API Google
    
    economist_notes, eco_time = await measure_time(run_economist_agent, payload_dict)
    await asyncio.sleep(2) # Memberi jeda lagi sebelum memanggil Chief Advisor
    
    # 4. Run Chief Policy Advisor (Synthesis)
    advisor_synthesis, adv_time = await measure_time(
        run_chief_advisor_agent, payload_dict, epidemiologist_notes, economist_notes
    )
    
    return {
        "status": "success",
        "metadata": payload.metadata,
        "processed_records": payload.metadata.total_records,
        "predicted_risk_class": predicted_risk_class,
        "predicted_health_risk_status": health_risk_status,
        "onnx_accuracy_score": confidence_score,
        "agent_responses": {
            "epidemiologist": epidemiologist_notes,
            "economist": economist_notes,
            "advisor": advisor_synthesis
        },
        "execution_times": {
            "epidemiologist": epi_time,
            "economist": eco_time,
            "advisor": adv_time
        }
    }