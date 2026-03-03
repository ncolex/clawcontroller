import { Layout, Users, MessageSquare, PlusCircle, Settings } from 'lucide-react'
import { useMissionStore } from '../store/useMissionStore'

export default function MobileNavBar() {
  const toggleChat = useMissionStore((s) => s.toggleChat)
  const openAgentManagement = useMissionStore((s) => s.openAgentManagement)
  const isChatOpen = useMissionStore((s) => s.isChatOpen)
  const toggleRecurringPanel = useMissionStore((s) => s.toggleRecurringPanel)
  const openNewTaskModal = useMissionStore((s) => s.openNewTaskModal)

  return (
    <div className="mobile-nav">
      <button 
        className="mobile-nav-item active" 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        aria-label="Board"
      >
        <Layout size={22} />
        <span>Board</span>
      </button>

      <button 
        className="mobile-nav-item" 
        onClick={openAgentManagement}
        aria-label="Agents"
      >
        <Users size={22} />
        <span>Agents</span>
      </button>

      <button 
        className="mobile-nav-item" 
        onClick={openNewTaskModal}
        aria-label="New Task"
      >
        <PlusCircle size={24} style={{ color: '#F97316' }} />
        <span>New</span>
      </button>

      <button 
        className={`mobile-nav-item ${isChatOpen ? 'active' : ''}`} 
        onClick={toggleChat}
        aria-label="Chat"
      >
        <MessageSquare size={22} />
        <span>Chat</span>
      </button>

      <button 
        className="mobile-nav-item" 
        onClick={toggleRecurringPanel}
        aria-label="Automation"
      >
        <Settings size={22} />
        <span>Auto</span>
      </button>
    </div>
  )
}
