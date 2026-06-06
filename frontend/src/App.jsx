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
  PieChart
} from 'lucide-react';
import healthData from './assets/data/health_payload.json';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('payload');

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await axios.post('http://localhost:8000/api/analyze', healthData);
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
              <Activity size={20} color="var(--accent-cyan)" />
              Sistem Kendali
            </h3>
            
            <button 
              className="analyze-btn" 
              onClick={handleAnalyze} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <BrainCircuit className="loader" size={20} />
                  Agen Sedang Berdiskusi...
                </>
              ) : (
                <>
                  <Activity size={20} />
                  Mulai Analisis Multi-Agent
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
              Visualisasi Indikator
            </h3>
            <div className="chart-container">
              {renderBar("Akses Air Bersih", healthData.infrastructure_indicators.clean_water_access_pct, "var(--accent-cyan)")}
              {renderBar("Akses Sanitasi", healthData.infrastructure_indicators.sanitation_access_pct, "var(--accent-blue)")}
              {renderBar("Tingkat Imunisasi", healthData.clinical_indicators.immunization_rate_pct, "var(--accent-green)")}
              {renderBar("Anggaran (% PDB)", healthData.economic_indicators.health_expenditure_pct * 5, "var(--accent-purple)")} 
            </div>
            <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic'}}>
              *Anggaran dinormalisasi untuk perbandingan visual. Insidensi TB: {healthData.clinical_indicators.tb_incidence_per_100k}/100k.
            </p>
          </div>
        </div>

        {/* Right Column: Agents Discussion / Output */}
        <div className="agents-section">
          {!result && !loading && (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
              <BrainCircuit size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Menunggu inisialisasi diskusi agen...</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Klik tombol "Mulai Analisis Multi-Agent" di panel kiri.</p>
            </div>
          )}

          {loading && (
            <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loader" style={{ marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>
                <BrainCircuit size={48} />
              </div>
              <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Memproses Model & Analisis</h3>
              <p style={{ color: 'var(--text-muted)' }}>1. Epidemiolog sedang meninjau data klinis...</p>
              <p style={{ color: 'var(--text-muted)' }}>2. Ekonom sedang menghitung rasio PDB...</p>
              <p style={{ color: 'var(--text-muted)' }}>3. Kepala Penasihat sedang menyusun sintesis akhir...</p>
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
                    <h4><BrainCircuit size={16} /> Mengapa Gemini / Agen memutuskan hal ini? (Rationale)</h4>
                    <p>{result.agent_responses?.advisor?.rationale || "Tidak ada penjelasan kompromi."}</p>
                  </div>
                  <div className="details-block">
                    <h4><BookOpen size={16} /> Bukti Referensi Data yang Digunakan</h4>
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