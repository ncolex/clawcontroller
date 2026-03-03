import { Cpu, Server, Download, HardDrive, Activity, Zap, CheckCircle, AlertCircle, Power } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api'
import { useMissionStore } from '../store/useMissionStore'

// Model card with animation
function OllamaModelCard({ model, index, isActive }) {
  const familyColors = {
    llama: '#f97316',
    gemma: '#3b82f6',
    phi3: '#8b5cf6',
    mistral: '#10b981',
    gemma3: '#06b6d4',
    nemotron_h_moe: '#a855f7',
    gptoss: '#6b7280',
    unknown: '#71717a'
  }

  const color = familyColors[model.family?.toLowerCase()] || familyColors.unknown

  return (
    <div 
      className={`ollama-model-card ${isActive ? 'ollama-model-card--active' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {isActive && (
        <div className="model-active-badge">
          <Power size={10} className="spin-icon" />
          Active
        </div>
      )}
      <div className="model-card-header">
        <div className="model-name" title={model.name}>
          {model.name.split(':')[0]}
          {model.name.includes(':') && (
            <span className="model-tag">{model.name.split(':')[1]}</span>
          )}
        </div>
        {model.is_remote ? (
          <div className="model-badge-remote">
            <Download size={10} />
            Cloud
          </div>
        ) : (
          <div className="model-badge-local">
            <CheckCircle size={10} />
            Local
          </div>
        )}
      </div>

      <div className="model-card-body">
        <div className="model-stat">
          <HardDrive size={12} />
          <span>{model.size_gb} GB</span>
        </div>
        <div className="model-stat">
          <Cpu size={12} />
          <span>{model.params}</span>
        </div>
        <div className="model-stat" title={model.quantization}>
          <Zap size={12} />
          <span>{model.quantization?.substring(0, 6)}</span>
        </div>
      </div>
      
      <div 
        className="model-family-indicator"
        style={{ backgroundColor: color }}
        title={`Family: ${model.family}`}
      />
    </div>
  )
}

// Progress ring for Ollama status
function StatusRing({ available, loading }) {
  return (
    <div className={`status-ring ${loading ? 'status-ring--loading' : ''} ${available ? 'status-ring--online' : 'status-ring--offline'}`}>
      <div className="status-ring-circle">
        <div className="status-ring-fill" />
      </div>
      <div className="status-ring-center">
        {loading ? (
          <Activity size={20} className="spin-icon" />
        ) : available ? (
          <CheckCircle size={20} />
        ) : (
          <AlertCircle size={20} />
        )}
      </div>
    </div>
  )
}

export default function OllamaStatusPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [ollamaData, setOllamaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const agents = useMissionStore((state) => state.agents)
  
  // Fetch Ollama status
  useEffect(() => {
    const fetchOllamaStatus = async () => {
      try {
        setLoading(true)
        const data = await api.get('/api/ollama/status')
        setOllamaData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setOllamaData(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOllamaStatus()
    const interval = setInterval(fetchOllamaStatus, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])
  
  // Get active models from agents
  const activeModelNames = agents
    .filter(agent => agent.model)
    .map(agent => {
      const modelStr = agent.model.primary || agent.model
      if (!modelStr) return null
      // Extract model name (e.g., "ollama/phi3" -> "phi3", "llama3:latest" -> "llama3")
      const modelName = modelStr.split('/').pop()?.split(':')[0]
      return modelName?.toLowerCase()
    })
    .filter(Boolean)
  
  if (!ollamaData && !loading) return null
  
  return (
    <section className={`ollama-status-panel ${isCollapsed ? 'ollama-status-panel--collapsed' : ''}`}>
      <div className="panel-header ollama-header">
        <div className="header-left">
          <Server size={20} className={`header-icon ${ollamaData?.available ? 'online' : 'offline'}`} />
          <div>
            <h3>Ollama Local</h3>
            <span className="panel-subtitle">
              {ollamaData?.url || 'http://localhost:11434'}
              {ollamaData?.available && (
                <span className="status-badge status-badge--online">
                  ● Online
                </span>
              )}
              {!ollamaData?.available && !loading && (
                <span className="status-badge status-badge--offline">
                  ● Offline
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? '+' : '−'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="ollama-content">
          {loading ? (
            <div className="ollama-loading">
              <Activity size={24} className="spin-icon" />
              <span>Checking Ollama status...</span>
            </div>
          ) : error ? (
            <div className="ollama-error">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          ) : ollamaData ? (
            <>
              {/* Stats Bar */}
              <div className="ollama-stats-bar">
                <div className="ollama-stat">
                  <div className="ollama-stat-icon">
                    <Cpu size={18} />
                  </div>
                  <div className="ollama-stat-info">
                    <span className="ollama-stat-value">{ollamaData.total_models}</span>
                    <span className="ollama-stat-label">Total Models</span>
                  </div>
                </div>
                
                <div className="ollama-stat">
                  <div className="ollama-stat-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div className="ollama-stat-info">
                    <span className="ollama-stat-value">{ollamaData.local_models}</span>
                    <span className="ollama-stat-label">Local</span>
                  </div>
                </div>
                
                <div className="ollama-stat">
                  <div className="ollama-stat-icon">
                    <Download size={18} />
                  </div>
                  <div className="ollama-stat-info">
                    <span className="ollama-stat-value">{ollamaData.remote_models}</span>
                    <span className="ollama-stat-label">Cloud</span>
                  </div>
                </div>
                
                <div className="ollama-stat">
                  <div className="ollama-stat-icon">
                    <HardDrive size={18} />
                  </div>
                  <div className="ollama-stat-info">
                    <span className="ollama-stat-value">{ollamaData.total_size_gb}</span>
                    <span className="ollama-stat-label">GB Used</span>
                  </div>
                </div>
              </div>
              
              {/* Models Grid */}
              {ollamaData.models && ollamaData.models.length > 0 && (
                <div className="ollama-models-grid">
                  {ollamaData.models.map((model, index) => {
                    const modelName = model.name.split(':')[0].toLowerCase()
                    const isActive = activeModelNames.includes(modelName)
                    return (
                      <OllamaModelCard 
                        key={model.name} 
                        model={model} 
                        index={index}
                        isActive={isActive}
                      />
                    )
                  })}
                </div>
              )}
              
              {/* Model Family Distribution */}
              {ollamaData.models && ollamaData.models.length > 0 && (
                <div className="ollama-family-dist">
                  <h4 className="section-title">
                    <Activity size={14} />
                    Model Families
                  </h4>
                  <div className="family-bars">
                    {Object.entries(
                      ollamaData.models.reduce((acc, m) => {
                        const family = m.family?.toLowerCase() || 'unknown'
                        acc[family] = (acc[family] || 0) + 1
                        return acc
                      }, {})
                    ).map(([family, count]) => {
                      const percentage = (count / ollamaData.models.length) * 100
                      const familyColors = {
                        llama: '#f97316',
                        gemma: '#3b82f6',
                        phi3: '#8b5cf6',
                        mistral: '#10b981',
                        gemma3: '#06b6d4',
                        nemotron_h_moe: '#a855f7',
                        gptoss: '#6b7280',
                        unknown: '#71717a'
                      }
                      const color = familyColors[family] || familyColors.unknown
                      
                      return (
                        <div key={family} className="family-bar-item">
                          <div className="family-bar-header">
                            <span className="family-name">{family}</span>
                            <span className="family-count">{count}</span>
                          </div>
                          <div className="family-bar">
                            <div 
                              className="family-bar-fill"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: color
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </section>
  )
}
