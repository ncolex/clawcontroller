import { useState, useEffect } from 'react'
import { useMissionStore } from '../store/useMissionStore'

const STEPS = {
  DESCRIBE: 1,
  LOADING: 2,
  REVIEW: 3,
}

// Pre-configured orchestrator template
const ORCHESTRATOR_CONFIG = {
  id: 'main',
  name: 'Orchestrator',
  emoji: '🎯',
  model: '',
  soul: `# Orchestrator Agent

You are the primary orchestrator and squad lead. Your role is to:

1. **Receive tasks** from the human and break them down into actionable work
2. **Delegate** to specialist agents based on their capabilities
3. **Monitor progress** and ensure tasks are completed properly
4. **Report back** with summaries and results

## Working Style

- Be proactive about clarifying requirements before delegating
- Check in on delegated tasks and follow up if needed
- Synthesize results from multiple agents into coherent responses
- Escalate blockers or decisions that need human input

## Communication

- Keep the human informed of significant progress
- Be concise but thorough in status updates
- Flag risks or concerns early

You are the central coordinator. Other agents report to you.`,
  tools: `# Tools & Integrations

## Available Tools

Document any tool configurations, API keys, or integrations here.

## Agent Team

List your specialist agents and their capabilities:

- **Agent Name**: Description of what they do

## Preferences

- Preferred communication style
- Working hours
- Any special instructions`,
  agentsMd: `# Workspace

This is the main orchestrator workspace.

## Memory

Use \`memory/YYYY-MM-DD.md\` files to track daily work and decisions.

## Guidelines

- Delegate complex tasks to specialists
- Keep the human informed of progress
- Document important decisions`,
}

export default function AddAgentWizard({ mode }) {
  const availableModels = useMissionStore((s) => s.availableModels)
  const loadingAgentManagement = useMissionStore((s) => s.loadingAgentManagement)
  const closeAddAgentWizard = useMissionStore((s) => s.closeAddAgentWizard)
  const generateAgentConfig = useMissionStore((s) => s.generateAgentConfig)
  const createAgent = useMissionStore((s) => s.createAgent)

  // Determine initial step based on mode
  const initialStep = mode === 'orchestrator' ? STEPS.REVIEW : STEPS.DESCRIBE
  
  const [step, setStep] = useState(initialStep)
  const [description, setDescription] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  
  // Agent config fields
  const [agentId, setAgentId] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentEmoji, setAgentEmoji] = useState('🤖')
  const [agentModel, setAgentModel] = useState('')
  const [soulMd, setSoulMd] = useState('')
  const [toolsMd, setToolsMd] = useState('')
  const [agentsMd, setAgentsMd] = useState('')
  
  const [error, setError] = useState('')

  // Initialize with orchestrator config if in orchestrator mode
  useEffect(() => {
    if (mode === 'orchestrator') {
      setAgentId(ORCHESTRATOR_CONFIG.id)
      setAgentName(ORCHESTRATOR_CONFIG.name)
      setAgentEmoji(ORCHESTRATOR_CONFIG.emoji)
      setAgentModel(ORCHESTRATOR_CONFIG.model)
      setSoulMd(ORCHESTRATOR_CONFIG.soul)
      setToolsMd(ORCHESTRATOR_CONFIG.tools)
      setAgentsMd(ORCHESTRATOR_CONFIG.agentsMd)
    }
  }, [mode])

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe what the agent should do')
      return
    }
    
    setError('')
    setOriginalDescription(description)
    setStep(STEPS.LOADING)
    
    try {
      const config = await generateAgentConfig(description)
      setAgentId(config.id || '')
      setAgentName(config.name || '')
      setAgentEmoji(config.emoji || '🤖')
      setAgentModel(config.model || '')
      setSoulMd(config.soul || '')
      setToolsMd(config.tools || '')
      setAgentsMd(config.agentsMd || '')
      setStep(STEPS.REVIEW)
    } catch (err) {
      setError('Failed to generate config. Please try again.')
      setStep(STEPS.DESCRIBE)
    }
  }

  const handleRefine = () => {
    setDescription(originalDescription + '\n\n[Refinement]: ')
    setStep(STEPS.DESCRIBE)
  }

  const handleCreate = async () => {
    if (!agentId.trim()) {
      setError('Agent ID is required')
      return
    }
    
    if (!/^[a-z0-9-]+$/.test(agentId)) {
      setError('Agent ID can only contain lowercase letters, numbers, and hyphens')
      return
    }
    
    setError('')
    
    try {
      await createAgent({
        id: agentId,
        name: agentName,
        emoji: agentEmoji,
        model: agentModel,
        soul: soulMd,
        tools: toolsMd,
        agentsMd: agentsMd,
      })
    } catch (err) {
      setError(err.message || 'Failed to create agent')
    }
  }

  const handleIdChange = (e) => {
    setAgentId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
  }

  const isOrchestrator = mode === 'orchestrator'
  const title = isOrchestrator ? '🎯 Initialize Orchestrator' : '✨ Create New Agent'
  const stepLabel = step === STEPS.DESCRIBE ? 'Step 1 of 2' :
                    step === STEPS.LOADING ? 'Generating...' :
                    isOrchestrator ? 'Review & Create' : 'Step 2 of 2'

  return (
    <div className="modal-overlay agent-wizard-overlay" onClick={closeAddAgentWizard}>
      <div className="modal add-agent-wizard" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-label">{stepLabel}</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={closeAddAgentWizard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-content">
          {error && (
            <div className="wizard-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          {step === STEPS.DESCRIBE && (
            <div className="wizard-step">
              <p className="wizard-instruction">
                Describe what this agent should do. Be specific about its role, capabilities, and any special requirements.
              </p>
              
              <div className="field">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: A development agent that specializes in React and TypeScript. It should follow best practices, write tests, and document code thoroughly..."
                  rows={8}
                  className="wizard-textarea"
                  autoFocus
                />
              </div>
              
              <div className="wizard-examples">
                <span>Examples:</span>
                <button onClick={() => setDescription('A coding agent specialized in Python backend development with FastAPI and PostgreSQL')}>
                  Backend Dev
                </button>
                <button onClick={() => setDescription('A sales agent that handles lead qualification, outreach emails, and CRM management')}>
                  Sales Agent
                </button>
                <button onClick={() => setDescription('A research agent that investigates topics deeply, synthesizes findings, and creates detailed reports')}>
                  Researcher
                </button>
              </div>
            </div>
          )}

          {step === STEPS.LOADING && (
            <div className="wizard-loading">
              <div className="loading-spinner large" />
              <p>Generating agent configuration...</p>
            </div>
          )}

          {step === STEPS.REVIEW && (
            <div className="wizard-step wizard-review">
              {isOrchestrator && (
                <p className="wizard-instruction orchestrator-intro">
                  This is your main orchestrator agent. It will coordinate tasks and manage your agent team. 
                  Review the configuration below and customize as needed.
                </p>
              )}
              
              <div className="wizard-review-row">
                <div className="field" style={{ flex: 1 }}>
                  <label>Agent ID *</label>
                  <input
                    type="text"
                    value={agentId}
                    onChange={handleIdChange}
                    placeholder="my-agent"
                  />
                  <span className="field-hint">Lowercase, hyphens allowed</span>
                </div>
                <div className="field" style={{ width: '80px' }}>
                  <label>Emoji</label>
                  <input
                    type="text"
                    value={agentEmoji}
                    onChange={(e) => setAgentEmoji(e.target.value)}
                    placeholder="🤖"
                  />
                </div>
              </div>

              <div className="wizard-review-row">
                <div className="field" style={{ flex: 1 }}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent Name"
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Model</label>
                  <select
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                    className="wizard-select"
                  >
                    <option value="">Select model...</option>
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>SOUL.md</label>
                <textarea
                  value={soulMd}
                  onChange={(e) => setSoulMd(e.target.value)}
                  rows={10}
                  className="wizard-textarea wizard-textarea--code"
                />
              </div>

              <div className="field">
                <label>TOOLS.md</label>
                <textarea
                  value={toolsMd}
                  onChange={(e) => setToolsMd(e.target.value)}
                  rows={6}
                  className="wizard-textarea wizard-textarea--code"
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {step === STEPS.DESCRIBE && (
            <>
              <button className="secondary-button" onClick={closeAddAgentWizard}>
                Cancel
              </button>
              <button 
                className="primary-button" 
                onClick={handleGenerate}
                disabled={!description.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
                Generate Config
              </button>
            </>
          )}

          {step === STEPS.REVIEW && (
            <>
              {!isOrchestrator && (
                <button className="secondary-button" onClick={handleRefine}>
                  ← Refine
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="secondary-button" onClick={closeAddAgentWizard}>
                Cancel
              </button>
              <button 
                className="primary-button" 
                onClick={handleCreate}
                disabled={loadingAgentManagement || !agentId.trim()}
              >
                {loadingAgentManagement ? 'Creating...' : '🚀 Create Agent'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
