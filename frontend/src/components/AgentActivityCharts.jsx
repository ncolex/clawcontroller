import { Activity, TrendingUp, Clock, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMissionStore } from '../store/useMissionStore'
import { api } from '../api'

// Simple bar chart component using CSS
function BarChart({ data, color = '#F97316', height = 120 }) {
  if (!data || data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="bar-item">
          <div 
            className="bar"
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: item.color || color,
              minWidth: '20px'
            }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="bar-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// Simple line chart using SVG
function LineChart({ data, color = '#F97316', height = 120 }) {
  if (!data || data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 100
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className="line-chart" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart-svg">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="line-chart-point"
            >
              <title>{`${item.label}: ${item.value}`}</title>
            </circle>
          )
        })}
      </svg>
      <div className="line-chart-labels">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

// Donut chart using SVG
function DonutChart({ data, size = 120 }) {
  if (!data || data.length === 0) return null
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) return null
  
  // Calculate segments with cumulative percent using reduce pattern
  let cumulative = 0
  const segments = data.reduce((acc, item) => {
    const percent = (item.value / total) * 100
    const startPercent = cumulative
    cumulative += percent
    
    const startAngle = (startPercent / 100) * 360
    const endAngle = (cumulative / 100) * 360
    
    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (endAngle - 90) * Math.PI / 180
    
    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)
    
    const largeArc = percent > 50 ? 1 : 0
    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`
    
    acc.push({
      ...item,
      path: pathData,
      percent: percent.toFixed(1)
    })
    return acc
  }, [])
  
  return (
    <div className="donut-chart" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="donut-chart-svg">
        {segments.map((segment, index) => (
          <path
            key={index}
            d={segment.path}
            fill={segment.color}
            className="donut-segment"
          >
            <title>{`${segment.label}: ${segment.value} (${segment.percent}%)`}</title>
          </path>
        ))}
        <circle cx="50" cy="50" r="25" fill="var(--bg-secondary)" />
      </svg>
      <div className="donut-center">
        <span className="donut-total">{total}</span>
        <span className="donut-label">Total</span>
      </div>
    </div>
  )
}

export default function AgentActivityCharts() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [stats, setStats] = useState(null)
  const [agentMetrics, setAgentMetrics] = useState([])
  const isLoading = useMissionStore((state) => state.isLoading)
  const agents = useMissionStore((state) => state.agents)
  const liveFeed = useMissionStore((state) => state.liveFeed)
  
  // Fetch stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.get('/api/stats')
        setStats(statsData)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])
  
  // Build agent metrics from agents array
  useEffect(() => {
    if (agents.length === 0) return
    
    const metrics = agents.map(agent => {
      const agentActivities = liveFeed.filter(item => 
        item.agentId === agent.id || item.agent?.id === agent.id
      ).length
      
      return {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        color: agent.color,
        activityCount: agentActivities,
        emoji: agent.emoji
      }
    })
    
    setAgentMetrics(metrics)
  }, [agents, liveFeed])

  // Task status data for bar chart
  const taskStatusData = stats ? [
    { label: 'Inbox', value: stats.tasks_by_status?.INBOX || 0, color: '#6B7280' },
    { label: 'Assigned', value: stats.tasks_by_status?.ASSIGNED || 0, color: '#3B82F6' },
    { label: 'Progress', value: stats.tasks_by_status?.IN_PROGRESS || 0, color: '#F97316' },
    { label: 'Review', value: stats.tasks_by_status?.REVIEW || 0, color: '#A855F7' },
    { label: 'Done', value: stats.tasks_by_status?.DONE || 0, color: '#22C55E' },
  ] : []
  
  // Agent status data for donut chart
  const agentStatusData = agents.length > 0 ? [
    { 
      label: 'Working', 
      value: agents.filter(a => a.status === 'WORKING').length, 
      color: '#22C55E' 
    },
    { 
      label: 'Idle', 
      value: agents.filter(a => a.status === 'IDLE').length, 
      color: '#EAB308' 
    },
    { 
      label: 'Standby', 
      value: agents.filter(a => a.status === 'STANDBY').length, 
      color: '#0EA5E9' 
    },
    { 
      label: 'Offline', 
      value: agents.filter(a => a.status === 'OFFLINE').length, 
      color: '#71717A' 
    },
  ].filter(item => item.value > 0) : []
  
  // Activity type distribution
  const activityTypeData = liveFeed.length > 0 ? (() => {
    const typeCounts = {}
    liveFeed.forEach(item => {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
    })
    const typeColors = {
      task: '#F97316',
      comment: '#3B82F6',
      status: '#A855F7',
      announcement: '#EAB308'
    }
    return Object.entries(typeCounts).map(([type, count]) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: typeColors[type] || '#6B7280'
    }))
  })() : []
  
  return (
    <section className={`agent-activity-charts ${isCollapsed ? 'agent-activity-charts--collapsed' : ''}`}>
      <div className="panel-header">
        <div>
          <h3>
            <Activity size={18} style={{ marginRight: 8 }} />
            Agent Activity
          </h3>
          {!isCollapsed && <span className="panel-subtitle">Real-time metrics and performance</span>}
        </div>
        <button
          type="button"
          className="collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="charts-container">
          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                <Zap size={20} color="#22C55E" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.agents_active || 0}</span>
                <span className="stat-label">Active Agents</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)' }}>
                <Activity size={20} color="#F97316" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.tasks_in_queue || 0}</span>
                <span className="stat-label">Tasks in Queue</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                <Clock size={20} color="#A855F7" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{liveFeed.length}</span>
                <span className="stat-label">Recent Activities</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                <TrendingUp size={20} color="#3B82F6" />
              </div>
              <div className="stat-info">
                <span className="stat-value">{agents.length}</span>
                <span className="stat-label">Total Agents</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Task Status Distribution */}
            <div className="chart-card">
              <h4 className="chart-title">Task Status</h4>
              {isLoading ? (
                <div className="chart-loading">Loading...</div>
              ) : taskStatusData.length > 0 ? (
                <BarChart data={taskStatusData} height={140} />
              ) : (
                <div className="chart-empty">No tasks yet</div>
              )}
            </div>

            {/* Agent Status Distribution */}
            <div className="chart-card">
              <h4 className="chart-title">Agent Status</h4>
              {isLoading ? (
                <div className="chart-loading">Loading...</div>
              ) : agentStatusData.length > 0 ? (
                <div className="chart-with-legend">
                  <DonutChart data={agentStatusData} size={120} />
                  <div className="chart-legend">
                    {agentStatusData.map((item, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: item.color }} />
                        <span className="legend-label">{item.label}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chart-empty">No agents yet</div>
              )}
            </div>

            {/* Activity Type Distribution */}
            <div className="chart-card">
              <h4 className="chart-title">Activity Types</h4>
              {isLoading ? (
                <div className="chart-loading">Loading...</div>
              ) : activityTypeData.length > 0 ? (
                <BarChart data={activityTypeData} color="#A855F7" height={140} />
              ) : (
                <div className="chart-empty">No activity yet</div>
              )}
            </div>
          </div>

          {/* Agent Performance Table */}
          {agentMetrics.length > 0 && (
            <div className="chart-card full-width">
              <h4 className="chart-title">Agent Performance</h4>
              <div className="agent-metrics-table">
                <table>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Status</th>
                      <th>Activities</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentMetrics.map((agent) => (
                      <tr key={agent.id}>
                        <td>
                          <div className="agent-cell">
                            <span className="agent-emoji">{agent.emoji}</span>
                            <span className="agent-name">{agent.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${agent.status.toLowerCase()}`}>
                            {agent.status}
                          </span>
                        </td>
                        <td>{agent.activityCount}</td>
                        <td>
                          <div className="performance-bar">
                            <div 
                              className="performance-fill"
                              style={{ 
                                width: `${Math.min((agent.activityCount / Math.max(1, ...agentMetrics.map(m => m.activityCount))) * 100, 100)}%`,
                                backgroundColor: agent.color
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
