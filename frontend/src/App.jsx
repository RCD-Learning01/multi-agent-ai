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
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import defaultHealthData from './assets/data/health_payload.json';
import ReactMarkdown from 'react-markdown';
import './App.css';

const ExpandableAgentCard = ({ icon: Icon, title, className, content, children, isAdvisor = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isError = typeof content === 'string' && (content.includes('Error: 429') || content.toLowerCase().includes('exceeded'));

  return (
    <div className={`glass-panel agent-card ${className}`}>
      <div className="agent-header">
        <div className="agent-icon"><Icon size={20} /></div>
        <div className="agent-title">{title}</div>
      </div>
      <div className={`agent-content-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className={`agent-content ${isExpanded ? '' : 'line-clamp'}`} style={isAdvisor ? { fontSize: '1.05rem', color: '#fff' } : {}}>
          {isError ? (
            <p style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>
              ⚠️ Batas penggunaan API gratis tercapai (Error 429). Mohon tunggu sekitar 1 menit sebelum mengirim skenario baru.
            </p>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </div>
      {children}
      <button 
        className="expand-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
    </div>
  );
};

const EditableSlider = ({ label, value, setValue, color, max = 100 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    let num = parseFloat(editValue);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > max) num = max;
    setValue(num);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="slider-row">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        {isEditing ? (
          <input
            type="number"
            step="0.1"
            className="inline-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{ color }}
          />
        ) : (
          <span 
            className="slider-value" 
            style={{color, cursor: 'text'}} 
            onDoubleClick={handleDoubleClick}
            title="Double click untuk edit manual"
          >
            {value}%
          </span>
        )}
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
};

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
              <EditableSlider label="Akses Air Bersih" value={cleanWater} setValue={setCleanWater} color="var(--accent-cyan)" />
              <EditableSlider label="Akses Sanitasi" value={sanitation} setValue={setSanitation} color="var(--accent-blue)" />
              <EditableSlider label="Tingkat Imunisasi" value={immunization} setValue={setImmunization} color="var(--accent-green)" />
              <EditableSlider label="Anggaran Kesehatan (PDB)" value={expenditure} setValue={setExpenditure} color="var(--accent-purple)" max={15} />
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
                      <ExpandableAgentCard 
                        icon={Stethoscope}
                        title="Epidemiolog"
                        className="agent-epidemiologist"
                        content={msg.raw_data.epidemiologist}
                      />

                      <ExpandableAgentCard 
                        icon={DollarSign}
                        title="Ekonom Kesehatan"
                        className="agent-economist"
                        content={msg.raw_data.economist}
                      />

                      <ExpandableAgentCard 
                        icon={Shield}
                        title="Kepala Penasihat"
                        className="agent-advisor"
                        content={msg.raw_data.advisor?.synthesis}
                        isAdvisor={true}
                      />

                      <ExpandableAgentCard 
                        icon={BrainCircuit}
                        title="Dasar Pemikiran (Rationale)"
                        className="agent-advisor"
                        content={msg.raw_data.advisor?.rationale}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-container agent_response">
                <div className="agent-bubble-group">
                  <div className="metrics-grid" style={{marginBottom: '1rem'}}>
                    <div className="metric-card">
                      <div className="loader" style={{ marginBottom: '0.25rem', color: 'var(--accent-cyan)', display: 'inline-block' }}>
                        <BrainCircuit size={24} />
                      </div>
                      <div className="metric-label">Menganalisis memori dan skenario baru...</div>
                    </div>
                  </div>
                  
                  <div className="agents-container">
                    {[
                      { icon: Stethoscope, title: 'Epidemiolog', className: 'agent-epidemiologist' },
                      { icon: DollarSign, title: 'Ekonom Kesehatan', className: 'agent-economist' },
                      { icon: Shield, title: 'Kepala Penasihat', className: 'agent-advisor' },
                      { icon: BrainCircuit, title: 'Dasar Pemikiran (Rationale)', className: 'agent-advisor' }
                    ].map((agent, i) => (
                      <div key={i} className={`glass-panel agent-card ${agent.className}`}>
                        <div className="agent-header">
                          <div className="agent-icon"><agent.icon size={20} /></div>
                          <div className="agent-title">{agent.title}</div>
                        </div>
                        <div className="agent-content-wrapper collapsed">
                          <div className="agent-content skeleton-container">
                            <div className="skeleton-line" style={{ width: '100%' }}></div>
                            <div className="skeleton-line" style={{ width: '95%' }}></div>
                            <div className="skeleton-line" style={{ width: '90%' }}></div>
                            <div className="skeleton-line" style={{ width: '98%' }}></div>
                            <div className="skeleton-line" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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