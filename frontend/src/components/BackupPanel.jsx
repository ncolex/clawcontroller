import { useState, useEffect } from 'react'
import { HardDrive, Cloud, Server, Shield, CheckCircle, AlertCircle, Clock, ExternalLink, Copy, Database, GitBranch, Zap } from 'lucide-react'
import { api } from '../api'

// Status badge component
function StatusBadge({ active, label }) {
  return (
    <div className={`status-badge ${active ? 'status-badge--active' : 'status-badge--inactive'}`}>
      {active ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      <span>{label}</span>
    </div>
  )
}

// Service card component
function ServiceCard({ name, service, icon: Icon }) {
  return (
    <div className={`service-card ${service.active ? 'service-card--active' : ''}`}>
      <div className="service-header">
        <div className="service-icon">
          <Icon size={24} />
        </div>
        <div className="service-info">
          <h4 className="service-name">{name}</h4>
          <StatusBadge 
            active={service.active} 
            label={service.active ? 'Running' : 'Stopped'} 
          />
        </div>
      </div>
      
      <div className="service-details">
        <div className="detail-row">
          <span className="detail-label">PID:</span>
          <span className="detail-value">{service.pid || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Auto-start:</span>
          <StatusBadge 
            active={service.auto_start} 
            label={service.auto_start ? 'Enabled' : 'Disabled'} 
          />
        </div>
      </div>
    </div>
  )
}

// Info card component
function InfoCard({ title, items, icon: Icon }) {
  const [copied, setCopied] = useState(null)
  
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }
  
  return (
    <div className="info-card">
      <div className="info-header">
        <Icon size={18} />
        <h4>{title}</h4>
      </div>
      <div className="info-list">
        {items.map((item, index) => (
          <div key={index} className="info-item">
            <span className="info-item-label">{item.label}</span>
            <div className="info-item-value">
              <span>{item.value}</span>
              {item.copyable && (
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(item.value, index)}
                  title="Copy to clipboard"
                >
                  {copied === index ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
              )}
              {item.external && (
                <a href={item.value} target="_blank" rel="noopener noreferrer" className="external-link">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BackupPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [backupData, setBackupData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch backup status
  useEffect(() => {
    const fetchBackupStatus = async () => {
      try {
        setLoading(true)
        const data = await api.get('/api/system/backup-status')
        setBackupData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setBackupData(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBackupStatus()
    const interval = setInterval(fetchBackupStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])
  
  if (!backupData && !loading) return null
  
  return (
    <section className={`backup-panel ${isCollapsed ? 'backup-panel--collapsed' : ''}`}>
      <div className="panel-header backup-header">
        <div className="header-left">
          <HardDrive size={20} className="header-icon" />
          <div>
            <h3>System Backup & Status</h3>
            <span className="panel-subtitle">
              {backupData ? (
                <>
                  Services: {backupData.services?.ollama?.status} • 
                  Auto-start: {backupData.systemd?.lingering_enabled ? 'Enabled' : 'Disabled'} •
                  Backup: {backupData.backup?.google_drive?.configured ? 'Configured' : 'Not Found'}
                </>
              ) : 'Loading...'}
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
        <div className="backup-content">
          {loading ? (
            <div className="backup-loading">
              <Cloud size={24} className="spin-icon" />
              <span>Loading system status...</span>
            </div>
          ) : error ? (
            <div className="backup-error">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          ) : backupData ? (
            <>
              {/* Services Status */}
              <div className="backup-section">
                <h4 className="section-title">
                  <Server size={18} />
                  Services Status
                </h4>
                <div className="services-grid">
                  <ServiceCard 
                    name="Ollama" 
                    service={backupData.services?.ollama} 
                    icon={Database}
                  />
                  <ServiceCard 
                    name="ClawController" 
                    service={backupData.services?.clawcontroller} 
                    icon={Server}
                  />
                </div>
              </div>
              
              {/* Systemd Configuration */}
              <div className="backup-section">
                <h4 className="section-title">
                  <Zap size={18} />
                  Systemd Auto-Start
                </h4>
                <div className="systemd-info">
                  <div className="systemd-status">
                    <StatusBadge 
                      active={backupData.systemd?.lingering_enabled} 
                      label={`Lingering ${backupData.systemd?.lingering_enabled ? 'Enabled' : 'Disabled'}`}
                    />
                    <p className="systemd-description">
                      {backupData.systemd?.lingering_enabled 
                        ? `Services auto-start for user "${backupData.systemd.username}" even without login`
                        : 'Lingering not enabled - services require user login'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Backup Info */}
              <div className="backup-section">
                <h4 className="section-title">
                  <Cloud size={18} />
                  Google Drive Backup
                </h4>
                <div className="backup-info-card">
                  <div className="backup-status">
                    <StatusBadge 
                      active={backupData.backup?.google_drive?.configured} 
                      label={backupData.backup?.google_drive?.configured ? 'Configured' : 'Not Found'}
                    />
                  </div>
                  {backupData.backup?.google_drive?.configured && (
                    <div className="backup-details">
                      <div className="backup-item">
                        <HardDrive size={16} />
                        <span>Folder: <strong>{backupData.backup.google_drive.folder}</strong></span>
                      </div>
                      <div className="backup-item">
                        <Shield size={16} />
                        <span>Document: <strong>{backupData.backup.google_drive.document}</strong></span>
                      </div>
                      {backupData.backup.google_drive.last_backup && (
                        <div className="backup-item">
                          <Clock size={16} />
                          <span>Last Backup: <strong>{new Date(backupData.backup.google_drive.last_backup).toLocaleString()}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* URLs & Paths */}
              <div className="backup-section">
                <h4 className="section-title">
                  <ExternalLink size={18} />
                  Important URLs
                </h4>
                <InfoCard 
                  title="Access Points"
                  icon={Cloud}
                  items={[
                    { 
                      label: 'Vercel (Production)', 
                      value: backupData.deployment?.vercel?.url,
                      external: true,
                      copyable: true
                    },
                    { 
                      label: 'Local Frontend', 
                      value: 'http://localhost:5001',
                      copyable: true
                    },
                    { 
                      label: 'Local Backend', 
                      value: 'http://localhost:8000',
                      copyable: true
                    },
                    { 
                      label: 'Ollama API', 
                      value: 'http://localhost:11434',
                      copyable: true
                    }
                  ]}
                />
              </div>
              
              {/* Configuration Paths */}
              <div className="backup-section">
                <h4 className="section-title">
                  <GitBranch size={18} />
                  Configuration Files
                </h4>
                <InfoCard 
                  title="File Paths"
                  icon={HardDrive}
                  items={[
                    { 
                      label: 'OpenClaw Config', 
                      value: '/home/ncx/.openclaw/openclaw.json',
                      copyable: true
                    },
                    { 
                      label: 'ClawController Config', 
                      value: '/home/ncx/.clawcontroller/vercel.json',
                      copyable: true
                    },
                    { 
                      label: 'Data Directory', 
                      value: '/home/ncx/.clawcontroller/data/',
                      copyable: true
                    },
                    { 
                      label: 'Ollama Models', 
                      value: '/home/ncx/.ollama/models/',
                      copyable: true
                    }
                  ]}
                />
              </div>
              
              {/* Deployment Info */}
              <div className="backup-section">
                <h4 className="section-title">
                  <Zap size={18} />
                  Deployment Architecture
                </h4>
                <div className="architecture-grid">
                  <div className="arch-card">
                    <div className="arch-icon">☁️</div>
                    <div className="arch-info">
                      <strong>Frontend</strong>
                      <span>Vercel (React + Vite)</span>
                    </div>
                  </div>
                  <div className="arch-card">
                    <div className="arch-icon">🖥️</div>
                    <div className="arch-info">
                      <strong>Backend</strong>
                      <span>Local (FastAPI + Uvicorn)</span>
                    </div>
                  </div>
                  <div className="arch-card">
                    <div className="arch-icon">🔌</div>
                    <div className="arch-info">
                      <strong>Tunnel</strong>
                      <span>Cloudflare Tunnel</span>
                    </div>
                  </div>
                  <div className="arch-card">
                    <div className="arch-icon">🤖</div>
                    <div className="arch-info">
                      <strong>AI Models</strong>
                      <span>Ollama Local + Cloud APIs</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timestamp */}
              <div className="backup-timestamp">
                <Clock size={14} />
                <span>Last updated: {new Date(backupData.timestamp).toLocaleString()}</span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </section>
  )
}
