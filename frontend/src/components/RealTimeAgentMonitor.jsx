import { Activity, Brain, Cpu, Zap, Clock, TrendingUp, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useMissionStore } from '../store/useMissionStore'
import { api } from '../api'

// Animated pulse indicator
function PulseIndicator({ status, size = 12 }) {
  const statusColors = {
    WORKING: '#22C55E',
    IDLE: '#EAB308',
    STANDBY: '#0EA5E9',
    OFFLINE: '#71717A',
    ERROR: '#EF4444'
  }
  
  return (
    <div className="pulse-indicator" style={{ width: size, height: size }}>
      <div 
        className="pulse-dot" 
        style={{ 
          backgroundColor: statusColors[status] || '#71717A',
          width: size,
          height: size
        }}
      />
      <div 
        className="pulse-ring" 
        style={{ 
          backgroundColor: statusColors[status] || '#71717A',
          width: size,
          height: size
        }}
      />
    </div>
  )
}

// Animated thinking indicator
function ThinkingIndicator({ isThinking }) {
  if (!isThinking) return null
  
  return (
    <div className="thinking-indicator">
      <div className="thinking-dots">
        <div className="thinking-dot" />
        <div className="thinking-dot thinking-dot-2" />
        <div className="thinking-dot thinking-dot-3" />
      </div>
      <span className="thinking-text">Thinking...</span>
    </div>
  )
}

// Model badge with animation
function ModelBadge({ model }) {
  if (!model) return <span className="model-badge model-badge--unknown">Unknown</span>
  
  const modelColors = {
    'glm': 'from-purple-500 to-indigo-500',
    'gemini': 'from-blue-500 to-cyan-500',
    'llama': 'from-orange-500 to-red-500',
    'qwen': 'from-green-500 to-emerald-500',
    'gpt': 'from-teal-500 to-blue-500',
    'grok': 'from-gray-700 to-gray-900',
    'kimi': 'from-pink-500 to-rose-500'
  }
  
  const modelKey = Object.keys(modelColors).find(key => model.toLowerCase().includes(key)) || 'unknown'
  const gradientClass = modelColors[modelKey] || 'from-gray-500 to-gray-700'
  
  return (
    <span className={`model-badge model-badge--${modelKey}`}>
      {model.split('/').pop()?.split(':')[0] || model}
    </span>
  )
}

// Activity wave animation
function ActivityWave({ activity = [] }) {
  const bars = 20
  
  return (
    <div className="activity-wave">
      {Array.from({ length: bars }).map((_, i) => {
        const intensity = activity[i % activity.length] || Math.random()
        const height = 10 + (intensity * 40)
        
        return (
          <div
            key={i}
            className="activity-wave-bar"
            style={{
              height: `${height}%`,
              animationDelay: `${i * 0.05}s`
            }}
          />
        )
      })}
    </div>
  )
}

// Task progress bar with animation
function TaskProgressBar({ progress = 0, status = 'pending' }) {
  const statusColors = {
    pending: '#71717A',
    working: '#F97316',
    completed: '#22C55E',
    error: '#EF4444'
  }
  
  return (
    <div className="task-progress">
      <div className="task-progress-bar">
        <div 
          className="task-progress-fill"
          style={{ 
            width: `${progress}%`,
            backgroundColor: statusColors[status] || statusColors.working
          }}
        />
      </div>
      <span className="task-progress-text">{Math.round(progress)}%</span>
    </div>
  )
}

// Agent thought bubble
function ThoughtBubble({ thought, agent }) {
  if (!thought) return null
  
  return (
    <div className="thought-bubble">
      <div className="thought-content">
        <Brain size={14} className="thought-icon" />
        <span className="thought-text">{thought}</span>
      </div>
      <div className="thought-tail" />
    </div>
  )
}

// Real-time agent card
function RealTimeAgentCard({ agent, metrics, thoughts, currentTask }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`realtime-agent-card ${expanded ? 'realtime-agent-card--expanded' : ''}`}
      style={{ borderColor: agent.color }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="agent-card-header">
        <div className="agent-identity">
          <div className="agent-avatar-large" style={{ backgroundColor: agent.color }}>
            <span>{agent.emoji}</span>
          </div>
          <div className="agent-basic-info">
            <div className="agent-name-row">
              <span className="agent-name">{agent.name}</span>
              <PulseIndicator status={agent.status} />
            </div>
            <ModelBadge model={agent.model?.primary || agent.model} />
          </div>
        </div>
        
        <div className="agent-status-indicators">
          <ThinkingIndicator isThinking={agent.status === 'WORKING'} />
          {currentTask && (
            <div className="current-task-badge">
              <Activity size={12} />
              <span>{currentTask.title?.substring(0, 20)}...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Activity Wave */}
      <div className="agent-activity-section">
        <div className="activity-header">
          <Cpu size={14} />
          <span>Activity Level</span>
        </div>
        <ActivityWave activity={metrics?.activityWave || [0.5, 0.7, 0.3, 0.8, 0.6]} />
      </div>
      
      {/* Current Task Progress */}
      {currentTask && (
        <div className="agent-task-section">
          <div className="task-header">
            <CheckCircle size={14} />
            <span>Current Task</span>
          </div>
          <div className="task-title">{currentTask.title}</div>
          <TaskProgressBar 
            progress={metrics?.taskProgress || 50} 
            status={agent.status === 'WORKING' ? 'working' : 'pending'}
          />
        </div>
      )}
      
      {/* Thought Bubble */}
      {thoughts && thoughts.length > 0 && (
        <div className="agent-thoughts">
          <div className="thoughts-header">
            <Brain size={14} />
            <span>Recent Thoughts</span>
          </div>
          <div className="thoughts-list">
            {thoughts.slice(0, 3).map((thought, i) => (
              <div key={i} className="thought-item">
                <MessageSquare size={12} />
                <span className="thought-preview">{thought}</span>
                <span className="thought-time">{i === 0 ? 'now' : `${i}m ago`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Expanded Details */}
      {expanded && (
        <div className="agent-expanded-details">
          <div className="detail-row">
            <span className="detail-label">Model:</span>
            <ModelBadge model={agent.model?.primary || agent.model} />
          </div>
          <div className="detail-row">
            <span className="detail-label">Workspace:</span>
            <span className="detail-value">{agent.workspace || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Tasks Completed:</span>
            <span className="detail-value">{metrics?.tasksCompleted || 0}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Avg Response Time:</span>
            <span className="detail-value">{metrics?.avgResponseTime || '--'}s</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Success Rate:</span>
            <span className="detail-value">{metrics?.successRate || '--'}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Main component
export default function RealTimeAgentMonitor() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [agentMetrics, setAgentMetrics] = useState({})
  const [agentThoughts, setAgentThoughts] = useState({})
  const [agentTasks, setAgentTasks] = useState({})
  const [globalStats, setGlobalStats] = useState(null)
  
  const agents = useMissionStore((state) => state.agents)
  const tasks = useMissionStore((state) => state.tasks)
  const liveFeed = useMissionStore((state) => state.liveFeed)
  const wsConnected = useMissionStore((state) => state.wsConnected)
  
  // Fetch global stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await api.get('/api/stats')
        setGlobalStats(stats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // Simulate real-time metrics updates
  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = {}
      const newThoughts = {}
      const newTasks = {}
      
      agents.forEach(agent => {
        // Generate activity wave data
        const activityWave = Array.from({ length: 20 }, () => 
          agent.status === 'WORKING' ? 0.3 + Math.random() * 0.7 : 0.1 + Math.random() * 0.2
        )
        
        // Calculate task progress for assigned tasks
        const agentTasksList = tasks.filter(t => t.assignedTo === agent.id && t.status !== 'DONE')
        const currentTask = agentTasksList[0]
        const taskProgress = currentTask ? 20 + Math.random() * 60 : 0
        
        // Simulate thoughts based on activity
        const thoughtTemplates = [
          `Analyzing task: ${currentTask?.title?.substring(0, 30) || 'pending'}...`,
          'Searching for optimal solution...',
          'Processing context window...',
          'Generating response...',
          'Validating output...',
          'Checking constraints...',
          'Optimizing approach...',
          'Reviewing previous results...'
        ]
        
        const thoughts = agent.status === 'WORKING' 
          ? thoughtTemplates.slice(0, 2 + Math.floor(Math.random() * 3))
          : []
        
        newMetrics[agent.id] = {
          activityWave,
          taskProgress,
          tasksCompleted: Math.floor(Math.random() * 20),
          avgResponseTime: (2 + Math.random() * 5).toFixed(1),
          successRate: (85 + Math.random() * 14).toFixed(1)
        }
        
        newThoughts[agent.id] = thoughts
        newTasks[agent.id] = currentTask
      })
      
      setAgentMetrics(newMetrics)
      setAgentThoughts(newThoughts)
      setAgentTasks(newTasks)
    }
    
    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [agents, tasks])
  
  // Calculate global metrics
  const totalTasks = globalStats?.tasks_in_queue || tasks.filter(t => t.status !== 'DONE').length
  const activeAgents = agents.filter(a => a.status === 'WORKING').length
  const totalActivities = liveFeed.length
  
  return (
    <section className={`realtime-agent-monitor ${isCollapsed ? 'realtime-agent-monitor--collapsed' : ''}`}>
      <div className="panel-header realtime-header">
        <div className="header-left">
          <Zap size={20} className="header-icon" />
          <div>
            <h3>Real-Time Agent Monitor</h3>
            <span className="panel-subtitle">
              {activeAgents} active • {totalTasks} tasks • {totalActivities} activities
              {wsConnected && <span className="ws-status ws-status--connected">● Live</span>}
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
        <div className="monitor-content">
          {/* Global Stats Bar */}
          <div className="global-stats-bar">
            <div className="global-stat">
              <TrendingUp size={18} />
              <span className="global-stat-value">{totalTasks}</span>
              <span className="global-stat-label">Tasks Active</span>
            </div>
            <div className="global-stat">
              <Activity size={18} />
              <span className="global-stat-value">{activeAgents}</span>
              <span className="global-stat-label">Agents Working</span>
            </div>
            <div className="global-stat">
              <Clock size={18} />
              <span className="global-stat-value">{totalActivities}</span>
              <span className="global-stat-label">Activities</span>
            </div>
            <div className="global-stat">
              <CheckCircle size={18} />
              <span className="global-stat-value">
                {globalStats?.tasks_by_status?.DONE || tasks.filter(t => t.status === 'DONE').length}
              </span>
              <span className="global-stat-label">Completed</span>
            </div>
          </div>
          
          {/* Agent Grid */}
          <div className="agent-grid">
            {agents.length === 0 ? (
              <div className="no-agents">
                <AlertCircle size={48} />
                <p>No agents configured</p>
                <span>Configure agents in OpenClaw to see real-time monitoring</span>
              </div>
            ) : (
              agents.map(agent => (
                <RealTimeAgentCard
                  key={agent.id}
                  agent={agent}
                  metrics={agentMetrics[agent.id]}
                  thoughts={agentThoughts[agent.id]}
                  currentTask={agentTasks[agent.id]}
                />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  )
}
