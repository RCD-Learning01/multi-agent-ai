from pydantic import BaseModel

class MetadataSchema(BaseModel):
    country: str
    year: int
    total_records: int

class EconomicIndicatorsSchema(BaseModel):
    gdp_per_capita: float
    health_expenditure_pct: float

class InfrastructureIndicatorsSchema(BaseModel):
    clean_water_access_pct: float
    sanitation_access_pct: float

class ClinicalIndicatorsSchema(BaseModel):
    tb_incidence_per_100k: float
    hiv_prevalence_pct: float
    immunization_rate_pct: float

# Model Utama yang menyatukan semua indikator (sesuai format JSON Anda)
class HealthDataPayload(BaseModel):
    metadata: MetadataSchema
    economic_indicators: EconomicIndicatorsSchema
    infrastructure_indicators: InfrastructureIndicatorsSchema
    clinical_indicators: ClinicalIndicatorsSchema
    user_prompt: str | None = None
    chat_history: list[dict] | None = None