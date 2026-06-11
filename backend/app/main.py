from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import HealthDataPayload
from app.ml_model import HealthONNXModel
from app.agents import run_epidemiologist_agent, run_economist_agent, run_chief_advisor_agent

import os
import asyncio
import time
from dotenv import load_dotenv
import google.generativeai as genai

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
    # Create the feature vector
    feature_vector = [
        payload.economic_indicators.gdp_per_capita,
        payload.economic_indicators.health_expenditure_pct,
        payload.infrastructure_indicators.clean_water_access_pct,
        payload.infrastructure_indicators.sanitation_access_pct,
        payload.clinical_indicators.tb_incidence_per_100k,
        payload.clinical_indicators.hiv_prevalence_pct,
        payload.clinical_indicators.immunization_rate_pct
    ]
    
    # Run prediction
    prediction = model.predict(feature_vector)
    accuracy_score = prediction[0] if prediction else 0.0
    
    # 2 & 3. Run Epidemiologist Agent & Health Economist Agent Concurrently
    # We run them in separate threads simultaneously so they don't block each other
    (epidemiologist_notes, epi_time), (economist_notes, eco_time) = await asyncio.gather(
        measure_time(run_epidemiologist_agent, payload_dict),
        measure_time(run_economist_agent, payload_dict)
    )
    
    # 4. Run Chief Policy Advisor (Synthesis)
    # Chief depends on both, so it runs after they finish
    advisor_synthesis, adv_time = await measure_time(
        run_chief_advisor_agent, payload_dict, epidemiologist_notes, economist_notes
    )
    
    return {
        "status": "success",
        "metadata": payload.metadata,
        "processed_records": payload.metadata.total_records,
        "onnx_accuracy_score": accuracy_score,
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