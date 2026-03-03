import { Activity, GitBranch, Clock, CheckCircle, AlertCircle, Cpu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api'

// Subagent card component
function SubagentCard({ subagent, parentAgent }) {
  const isActive = subagent.is_active
  
  return (
    <div className={`subagent-card ${isActive ? 'subagent-card--active' : ''}`}>
      <div className="subagent-header">
        <div className="subagent-identity">
          <div className="subagent-avatar">
            <GitBranch size={16} />
          </div>
          <div className="subagent-info">
            <span className="subagent-name">{subagent.parent_agent}</span>
            <span className="subagent-source">{subagent.source}</span>
          </div>
        </div>
        <div className={`subagent-status-badge ${subagent.status.toLowerCase()}`}>
          {isActive ? (
            <>
              <Activity size={10} className="spin-icon" />
              Working
            </>
          ) : (
            <>
              <Clock size={10} />
              Idle
            </>
          )}
        </div>
      </div>
      
      {subagent.current_task && (
        <div className="subagent-task">
          <div className="task-label">
            <Cpu size={10} />
            Current Task
          </div>
          <div className="task-title">{subagent.current_task.title}</div>
          <div className="task-status">
            <span className={`status-dot status-${subagent.current_task.status.toLowerCase().replace(' ', '-')}`}></span>
            {subagent.current_task.status}
          </div>
        </div>
      )}
      
      <div className="subagent-footer">
        <div className="activity-time">
          <Clock size={10} />
          <span>{subagent.time_since_update_seconds}s ago</span>
        </div>
        {!isActive && subagent.time_since_update_seconds > 60 && (
          <div className="inactive-warning">
            <AlertCircle size={10} />
            <span>Inactive</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubagentsPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [subagentsData, setSubagentsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch subagents status
  useEffect(() => {
    const fetchSubagentsStatus = async () => {
      try {
        setLoading(true)
        const data = await api.get('/api/subagents/status')
        setSubagentsData(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        setSubagentsData(null)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubagentsStatus()
    const interval = setInterval(fetchSubagentsStatus, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section className={`subagents-panel ${isCollapsed ? 'subagents-panel--collapsed' : ''}`}>
      <div className="panel-header subagents-header">
        <div className="header-left">
          <GitBranch size={20} className="header-icon" />
          <div>
            <h3>Subagents Activity</h3>
            <span className="panel-subtitle">
              {subagentsData ? (
                <>
                  {subagentsData.active_subagents} active / {subagentsData.total_subagents} total
                  {subagentsData.active_subagents > 0 && (
                    <span className="ws-status ws-status--connected">● Live</span>
                  )}
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
        <div className="subagents-content">
          {loading ? (
            <div className="subagents-loading">
              <Activity size={24} className="spin-icon" />
              <span>Monitoring subagents...</span>
            </div>
          ) : error ? (
            <div className="subagents-error">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          ) : !subagentsData || subagentsData.subagents.length === 0 ? (
            <div className="subagents-empty">
              <GitBranch size={48} />
              <p>No active subagents</p>
              <span>Subagents will appear here when spawned by parent agents</span>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="subagents-stats-bar">
                <div className="subagent-stat">
                  <div className="subagent-stat-icon working">
                    <Activity size={16} />
                  </div>
                  <div className="subagent-stat-info">
                    <span className="subagent-stat-value">{subagentsData.active_subagents}</span>
                    <span className="subagent-stat-label">Active</span>
                  </div>
                </div>
                
                <div className="subagent-stat">
                  <div className="subagent-stat-icon idle">
                    <Clock size={16} />
                  </div>
                  <div className="subagent-stat-info">
                    <span className="subagent-stat-value">{subagentsData.total_subagents - subagentsData.active_subagents}</span>
                    <span className="subagent-stat-label">Idle</span>
                  </div>
                </div>
                
                <div className="subagent-stat">
                  <div className="subagent-stat-icon total">
                    <GitBranch size={16} />
                  </div>
                  <div className="subagent-stat-info">
                    <span className="subagent-stat-value">{subagentsData.total_subagents}</span>
                    <span className="subagent-stat-label">Total</span>
                  </div>
                </div>
              </div>
              
              {/* Subagents Grid */}
              <div className="subagents-grid">
                {subagentsData.subagents.map((subagent) => (
                  <SubagentCard 
                    key={subagent.session_key} 
                    subagent={subagent}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
