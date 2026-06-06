import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, 
  BrainCircuit, 
  DollarSign, 
  Stethoscope, 
  Shield, 
  BookOpen,
  PieChart,
  Send,
  Sliders
} from 'lucide-react';
import defaultHealthData from './assets/data/health_payload.json';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Memori percakapan
  const chatEndRef = useRef(null);

  // Dynamic Data States
  const [cleanWater, setCleanWater] = useState(defaultHealthData.infrastructure_indicators.clean_water_access_pct);
  const [sanitation, setSanitation] = useState(defaultHealthData.infrastructure_indicators.sanitation_access_pct);
  const [immunization, setImmunization] = useState(defaultHealthData.clinical_indicators.immunization_rate_pct);
  const [expenditure, setExpenditure] = useState(defaultHealthData.economic_indicators.health_expenditure_pct);

  const handleAnalyze = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    
    // Simpan history lama untuk dikirim ke backend
    const currentHistory = [...chatHistory];
    
    // Tambahkan user message secara optimistik ke UI
    const newUserMsg = { type: 'user', content: userPrompt };
    setChatHistory(prev => [...prev, newUserMsg]);
    
    const payloadPrompt = userPrompt;
    setUserPrompt(""); // Kosongkan input setelah dikirim

    try {
      const dynamicPayload = {
        ...defaultHealthData,
        infrastructure_indicators: {
          ...defaultHealthData.infrastructure_indicators,
          clean_water_access_pct: parseFloat(cleanWater),
          sanitation_access_pct: parseFloat(sanitation)
        },
        clinical_indicators: {
          ...defaultHealthData.clinical_indicators,
          immunization_rate_pct: parseFloat(immunization)
        },
        economic_indicators: {
          ...defaultHealthData.economic_indicators,
          health_expenditure_pct: parseFloat(expenditure)
        },
        user_prompt: payloadPrompt,
        chat_history: currentHistory.filter(msg => msg.type === 'agent_response').map(msg => msg.raw_data)
      };
      
      const response = await axios.post('http://localhost:8000/api/analyze', dynamicPayload);
      
      // Tambahkan response agen ke history
      const newAgentMsg = {
        type: 'agent_response',
        raw_data: {
          user: payloadPrompt,
          epidemiologist: response.data.agent_responses?.epidemiologist,
          economist: response.data.agent_responses?.economist,
          advisor: response.data.agent_responses?.advisor
        },
        onnx_score: response.data.onnx_accuracy_score
      };

      setChatHistory(prev => [...prev, newAgentMsg]);

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal menghubungi Backend. Pastikan server FastAPI menyala dan API KEY sudah diset.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll ke bawah saat history bertambah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const renderSlider = (label, value, setValue, color, max=100) => (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value" style={{color}}>{value}%</span>
      </div>
      <input 
        type="range" 
        min="0" max={max} step="0.1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="custom-slider"
        style={{accentColor: color}}
      />
    </div>
  );

  return (
    <div className="App">
      <header className="header">
        <h1>Multi-Agent Health Analyzer</h1>
        <p>Sistem Otonom Perumusan Kebijakan (Dengan Memori) - Indonesia (2026)</p>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Controls & Metrics */}
        <div className="controls-section">
          
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={20} color="var(--accent-blue)" />
              Simulasi Indikator Dinamis
            </h3>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
              Geser nilai indikator di bawah untuk mengubah data yang akan dianalisis agen.
            </p>
            <div className="sliders-container">
              {renderSlider("Akses Air Bersih", cleanWater, setCleanWater, "var(--accent-cyan)")}
              {renderSlider("Akses Sanitasi", sanitation, setSanitation, "var(--accent-blue)")}
              {renderSlider("Tingkat Imunisasi", immunization, setImmunization, "var(--accent-green)")}
              {renderSlider("Anggaran Kesehatan (PDB)", expenditure, setExpenditure, "var(--accent-purple)", 15)} 
            </div>
          </div>

          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit size={20} color="var(--accent-purple)" />
              Kirim Instruksi Skenario
            </h3>
            
            <textarea
              className="chat-input"
              placeholder="Ketik instruksi khusus... (Misal: 'Bagaimana jika air bersih saya turunkan menjadi 60%?')"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnalyze(); } }}
            ></textarea>

            <button 
              className="analyze-btn" 
              onClick={handleAnalyze} 
              disabled={loading || !userPrompt.trim()}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              {loading ? (
                <>
                  <BrainCircuit className="loader" size={20} />
                  Agen Berdiskusi...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Kirim Diskusi
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Agents Discussion / Output */}
        <div className="agents-section">
          
          <div className="chat-history-container">
            {chatHistory.length === 0 && !loading && (
              <div className="glass-panel empty-chat" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                <BrainCircuit size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>Belum ada riwayat percakapan.</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Silakan sesuaikan slider dan kirim instruksi pertama Anda!</p>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-container ${msg.type}`}>
                {msg.type === 'user' ? (
                  <div className="user-bubble glass-panel">
                    <strong>Anda:</strong> {msg.content}
                  </div>
                ) : (
                  <div className="agent-bubble-group">
                    <div className="metrics-grid" style={{marginBottom: '1rem'}}>
                      <div className="metric-card">
                        <div className="metric-value">{(msg.onnx_score * 100).toFixed(1)}%</div>
                        <div className="metric-label">Prediksi ONNX LSTM (Health Index)</div>
                      </div>
                    </div>
                    
                    <div className="agents-container">
                      <div className="glass-panel agent-card agent-epidemiologist">
                        <div className="agent-header">
                          <div className="agent-icon"><Stethoscope size={20} /></div>
                          <div className="agent-title">Epidemiolog</div>
                        </div>
                        <div className="agent-content">{msg.raw_data.epidemiologist}</div>
                      </div>

                      <div className="glass-panel agent-card agent-economist">
                        <div className="agent-header">
                          <div className="agent-icon"><DollarSign size={20} /></div>
                          <div className="agent-title">Ekonom Kesehatan</div>
                        </div>
                        <div className="agent-content">{msg.raw_data.economist}</div>
                      </div>

                      <div className="glass-panel agent-card agent-advisor">
                        <div className="agent-header">
                          <div className="agent-icon"><Shield size={20} /></div>
                          <div className="agent-title">Kepala Penasihat</div>
                        </div>
                        <div className="agent-content" style={{ fontSize: '1.05rem', color: '#fff' }}>
                          {msg.raw_data.advisor?.synthesis}
                        </div>
                        <div className="details-section">
                          <div className="details-block">
                            <h4><BrainCircuit size={16} /> Rationale</h4>
                            <p>{msg.raw_data.advisor?.rationale}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="glass-panel loading-bubble">
                <div className="loader" style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                  <BrainCircuit size={32} />
                </div>
                <p style={{ color: 'var(--text-muted)' }}>Menganalisis memori dan skenario baru...</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;