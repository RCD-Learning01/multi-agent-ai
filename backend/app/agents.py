import google.generativeai as genai
from app.config import config
import json

# Configure Gemini
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)

def run_epidemiologist_agent(payload: dict) -> str:
    """
    Epidemiologist Agent analyzes disease data, water/sanitation, and immunization.
    """
    if not config.GEMINI_API_KEY:
        return "Epidemiologist Agent: GEMINI_API_KEY is missing. Cannot run LLM analysis."
        
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"""
Anda adalah seorang Agen Epidemiolog Medis senior.
Tugas Anda adalah menganalisis data kesehatan masyarakat berikut secara murni dari sudut pandang medis/klinis dan urgensi kesehatan, tanpa mempedulikan anggaran biaya.

Data Kesehatan:
{json.dumps(payload, indent=2)}

Analisis Anda harus mencakup:
1. Penilaian risiko terhadap akses sanitasi ({payload['infrastructure_indicators']['sanitation_access_pct']}%) dan air bersih ({payload['infrastructure_indicators']['clean_water_access_pct']}%).
2. Urgensi penanganan Penyakit Menular berdasarkan data TB ({payload['clinical_indicators']['tb_incidence_per_100k']} per 100k) dan HIV ({payload['clinical_indicators']['hiv_prevalence_pct']}%).
3. Status imunitas kelompok berdasarkan tingkat imunisasi ({payload['clinical_indicators']['immunization_rate_pct']}%).
4. Rekomendasi tindakan medis murni yang mendesak untuk menyelamatkan nyawa.

Berikan analisis yang jelas, tajam, dan profesional dalam Bahasa Indonesia.
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error running Epidemiologist Agent: {str(e)}"

def run_economist_agent(payload: dict) -> str:
    """
    Health Economist Agent analyzes budget constraints and GDP capacity.
    """
    if not config.GEMINI_API_KEY:
        return "Health Economist Agent: GEMINI_API_KEY is missing. Cannot run LLM analysis."
        
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"""
Anda adalah seorang Agen Ekonom Kesehatan senior.
Tugas Anda adalah menganalisis kapasitas finansial negara untuk mendanai program kesehatan masyarakat berdasarkan indikator ekonomi berikut.

Data Ekonomi:
- PDB Per Kapita (GDP per Capita): USD {payload['economic_indicators']['gdp_per_capita']}
- Persentase Pengeluaran Kesehatan dari PDB: {payload['economic_indicators']['health_expenditure_pct']}%

Analisis Anda harus mencakup:
1. Evaluasi kapasitas fiskal negara berdasarkan PDB per kapita dan alokasi anggaran saat ini.
2. Batasan anggaran yang realistis: Berapa besar skala program kesehatan baru yang bisa didanai tanpa mengganggu stabilitas ekonomi makro negara?
3. Rekomendasi efisiensi biaya: Di mana sebaiknya anggaran dialokasikan secara taktis (misal pencegahan vs pengobatan)?

Berikan analisis yang realistis, kritis, dan berorientasi pada kendala finansial dalam Bahasa Indonesia.
"""
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error running Health Economist Agent: {str(e)}"

def run_chief_advisor_agent(payload: dict, epidemiologist_notes: str, economist_notes: str) -> dict:
    """
    Chief Advisor synthesizes the arguments and creates the final policy recommendations,
    including references and reasons (rationale).
    """
    if not config.GEMINI_API_KEY:
        return {
            "synthesis": "Chief Policy Advisor: GEMINI_API_KEY is missing. Cannot synthesize.",
            "rationale": "Missing API Key",
            "references": []
        }
        
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    prompt = f"""
Anda adalah Kepala Penasihat Kebijakan Kesehatan Pemerintah (Chief Policy Advisor).
Tugas Anda adalah mengambil keputusan akhir dengan mensintesis argumen dari Agen Epidemiolog (urgensi klinis) dan Agen Ekonom Kesehatan (batasan anggaran). Anda harus mencari jalan tengah yang realistis, terukur, dan siap diimplementasikan secara taktis.

Data Indikator Kesehatan:
{json.dumps(payload, indent=2)}

Laporan dari Epidemiolog (Medis):
{epidemiologist_notes}

Laporan dari Ekonom Kesehatan (Finansial):
{economist_notes}

Harap keluarkan output dalam format JSON dengan struktur persis seperti berikut (jangan sertakan markdown block ```json atau apa pun di luar JSON yang valid agar bisa diparsing):
{{
  "synthesis": "Draft rekomendasi kebijakan publik final yang konkret, berbobot, dan siap diimplementasikan.",
  "rationale": "Mengapa Anda mengambil keputusan kebijakan seperti ini (penjelasan kompromi antara urgensi medis dan batas ekonomi)?",
  "references": [
    "Daftar referensi metrik spesifik dari data yang Anda jadikan dasar (misal: 'Akses Sanitasi 78.2%', 'GDP per Kapita USD 4500', dll.)"
  ]
}}
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean potential markdown wrapping
        if text.startswith("```"):
            lines = text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        result = json.loads(text)
        return result
    except Exception as e:
        return {
            "synthesis": f"Error running Chief Advisor Agent: {str(e)}",
            "rationale": "Gagal menghasilkan sintesis otomatis karena format respons atau masalah koneksi.",
            "references": [f"Metadata Country: {payload['metadata']['country']}"]
        }
