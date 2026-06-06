import { useState } from 'react';
import axios from 'axios';
import { 
  Activity, 
  BrainCircuit, 
  DollarSign, 
  Stethoscope, 
  Droplets, 
  Shield, 
  ChevronDown,
  BookOpen,
  PieChart,
  Send
} from 'lucide-react';
import healthData from './assets/data/health_payload.json';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Menambahkan user prompt dinamis ke dalam payload
      const dynamicPayload = {
        ...healthData,
        user_prompt: userPrompt
      };
      
      const response = await axios.post('http://localhost:8000/api/analyze', dynamicPayload);
      setResult(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal menghubungi Backend. Pastikan server FastAPI menyala.");
    } finally {
      setLoading(false);
    }
  };

  const renderBar = (label, value, color) => (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${value}%`, backgroundColor: color }}></div>
      </div>
      <div className="bar-value" style={{ color }}>{value}%</div>
    </div>
  );

  return (
    <div className="App">
      <header className="header">
        <h1>Multi-Agent Health Analyzer</h1>
        <p>Sistem Otonom Perumusan Kebijakan Kesehatan Masyarakat - {healthData.metadata.country} ({healthData.metadata.year})</p>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Controls & Metrics */}
        <div className="controls-section">
          
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit size={20} color="var(--accent-purple)" />
              Skenario Kebijakan (Chat)
            </h3>
            
            <textarea
              className="chat-input"
              placeholder="Ketik skenario khusus untuk agen AI... (Misal: 'Bagaimana jika anggaran dipotong 2%?')"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            ></textarea>

            <button 
              className="analyze-btn" 
              onClick={handleAnalyze} 
              disabled={loading}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {loading ? (
                <>
                  <BrainCircuit className="loader" size={20} />
                  Agen Sedang Berdiskusi...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Kirim & Analisis
                </>
              )}
            </button>

            {result && (
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-value">{(result.onnx_accuracy_score * 100).toFixed(1)}%</div>
                  <div className="metric-label">Health Index Score</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{result.processed_records}</div>
                  <div className="metric-label">Data Dianalisis</div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieChart size={20} color="var(--accent-blue)" />
              Visualisasi Indikator Data
            </h3>
            <div className="chart-container">
              {renderBar("Akses Air Bersih", healthData.infrastructure_indicators.clean_water_access_pct, "var(--accent-cyan)")}
              {renderBar("Akses Sanitasi", healthData.infrastructure_indicators.sanitation_access_pct, "var(--accent-blue)")}
              {renderBar("Tingkat Imunisasi", healthData.clinical_indicators.immunization_rate_pct, "var(--accent-green)")}
              {renderBar("Anggaran (% PDB)", healthData.economic_indicators.health_expenditure_pct * 5, "var(--accent-purple)")} 
            </div>
          </div>
        </div>

        {/* Right Column: Agents Discussion / Output */}
        <div className="agents-section">
          {!result && !loading && (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
              <BrainCircuit size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Menunggu prompt dari Anda...</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Silakan ketik skenario kebijakan atau langsung kirim analisis.</p>
            </div>
          )}

          {loading && (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loader" style={{ marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>
                <BrainCircuit size={48} />
              </div>
              <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Memproses Skonario & ONNX</h3>
              <p style={{ color: 'var(--text-muted)' }}>1. Epidemiolog meninjau dampak medis...</p>
              <p style={{ color: 'var(--text-muted)' }}>2. Ekonom menghitung kelayakan anggaran...</p>
              <p style={{ color: 'var(--text-muted)' }}>3. Penasihat menyusun sintesis akhir...</p>
            </div>
          )}

          {result && (
            <div className="agents-container">
              {/* Epidemiologist */}
              <div className="glass-panel agent-card agent-epidemiologist">
                <div className="agent-header">
                  <div className="agent-icon"><Stethoscope size={24} /></div>
                  <div className="agent-title">Agen Epidemiolog</div>
                </div>
                <div className="agent-content">
                  {result.agent_responses?.epidemiologist || "Tidak ada respons."}
                </div>
              </div>

              {/* Economist */}
              <div className="glass-panel agent-card agent-economist">
                <div className="agent-header">
                  <div className="agent-icon"><DollarSign size={24} /></div>
                  <div className="agent-title">Agen Ekonom Kesehatan</div>
                </div>
                <div className="agent-content">
                  {result.agent_responses?.economist || "Tidak ada respons."}
                </div>
              </div>

              {/* Chief Advisor */}
              <div className="glass-panel agent-card agent-advisor">
                <div className="agent-header">
                  <div className="agent-icon"><Shield size={24} /></div>
                  <div className="agent-title">Kepala Penasihat (Sintesis Final)</div>
                </div>
                <div className="agent-content" style={{ fontSize: '1.05rem', color: '#fff' }}>
                  {result.agent_responses?.advisor?.synthesis || "Gagal menyusun sintesis."}
                </div>
                
                <div className="details-section">
                  <div className="details-block">
                    <h4><BrainCircuit size={16} /> Mengapa keputusan ini diambil? (Rationale)</h4>
                    <p>{result.agent_responses?.advisor?.rationale || "Tidak ada penjelasan."}</p>
                  </div>
                  <div className="details-block">
                    <h4><BookOpen size={16} /> Referensi & Bukti</h4>
                    <ul>
                      {(result.agent_responses?.advisor?.references || []).map((ref, i) => (
                        <li key={i}>{ref}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;