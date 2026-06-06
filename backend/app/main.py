from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import HealthDataPayload
from app.ml_model import HealthONNXModel
from app.agents import run_epidemiologist_agent, run_economist_agent, run_chief_advisor_agent

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
    
    # 2. Run Epidemiologist Agent
    epidemiologist_notes = run_epidemiologist_agent(payload_dict)
    
    # 3. Run Health Economist Agent
    economist_notes = run_economist_agent(payload_dict)
    
    # 4. Run Chief Policy Advisor (Synthesis)
    advisor_synthesis = run_chief_advisor_agent(payload_dict, epidemiologist_notes, economist_notes)
    
    return {
        "status": "success",
        "metadata": payload.metadata,
        "processed_records": payload.metadata.total_records,
        "onnx_accuracy_score": accuracy_score,
        "agent_responses": {
            "epidemiologist": epidemiologist_notes,
            "economist": economist_notes,
            "advisor": advisor_synthesis
        }
    }