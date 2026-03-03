import { useEffect, useState } from 'react'
import { MessageCircle, Save, X, Plus, Trash2, Shield, Users, CheckCircle2 } from 'lucide-react'
import { useMissionStore } from '../store/useMissionStore'

export default function BotWAPanel() {
  const isOpen = useMissionStore((s) => s.isBotWAPanelOpen)
  const closeBotWAPanel = useMissionStore((s) => s.closeBotWAPanel)
  const fetchBotWAConfig = useMissionStore((s) => s.fetchBotWAConfig)
  const saveBotWAConfig = useMissionStore((s) => s.saveBotWAConfig)
  
  const [config, setConfig] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newNumber, setNewNumber] = useState({ type: 'whitelist', value: '' })

  useEffect(() => {
    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const data = await fetchBotWAConfig()
      setConfig(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveBotWAConfig(config)
      alert('¡Configuración de BotWA guardada con éxito!')
    } catch (err) {
      alert('Error al guardar la configuración: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const addNumber = (type) => {
    if (!newNumber.value) return
    const currentList = config[type] || []
    if (!currentList.includes(newNumber.value)) {
      setConfig({
        ...config,
        [type]: [...currentList, newNumber.value]
      })
    }
    setNewNumber({ ...newNumber, value: '' })
  }

  const removeNumber = (type, value) => {
    setConfig({
      ...config,
      [type]: config[type].filter(n => n !== value)
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="agent-mgmt-overlay" onClick={closeBotWAPanel} />
      <div className="agent-mgmt-panel" style={{ transform: 'translateX(0)', maxWidth: '600px' }}>
        <div className="agent-mgmt-header">
          <div className="agent-mgmt-header-left">
            <div style={{ background: '#25D366', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <MessageCircle size={24} color="white" />
            </div>
            <div style={{ marginLeft: '12px' }}>
                <h2 style={{ margin: 0 }}>BotWA Orchestrator</h2>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Configuración de WhatsApp</span>
            </div>
          </div>
          <button className="agent-mgmt-close" onClick={closeBotWAPanel}>
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            <div className="spinner" style={{ marginBottom: '10px' }}></div>
            Cargando configuración...
          </div>
        ) : config ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                
                <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} color="#25D366" /> 
                        Estado y Control
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                            <input 
                                type="checkbox" 
                                checked={config.autoReply} 
                                onChange={(e) => setConfig({...config, autoReply: e.target.checked})}
                                style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                            />
                            <span>Auto-Respuesta</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
                            <input 
                                type="checkbox" 
                                checked={config.allowGroups} 
                                onChange={(e) => setConfig({...config, allowGroups: e.target.checked})}
                                style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                            />
                            <span>Grupos</span>
                        </label>
                    </div>
                    
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Modo de Control:</label>
                        <select 
                            value={config.mode} 
                            onChange={(e) => setConfig({...config, mode: e.target.value})}
                            style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                        >
                            <option value="whitelist">Whitelist (Solo permitidos)</option>
                            <option value="blacklist">Blacklist (Todos excepto bloqueados)</option>
                        </select>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--muted)' }}>Mensaje de Bienvenida:</label>
                        <textarea 
                            value={config.welcomeMessage}
                            onChange={(e) => setConfig({...config, welcomeMessage: e.target.value})}
                            placeholder="Escribe el mensaje de bienvenida..."
                            style={{ width: '100%', minHeight: '80px', padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', resize: 'vertical' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {/* Whitelist */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                            <Users size={16} /> Whitelist
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input 
                                type="text" 
                                placeholder="Número (ej. 549...)" 
                                value={newNumber.type === 'whitelist' ? newNumber.value : ''}
                                onChange={(e) => setNewNumber({type: 'whitelist', value: e.target.value})}
                                style={{ flex: 1, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}
                                onKeyPress={(e) => e.key === 'Enter' && addNumber('whitelist')}
                            />
                            <button 
                                onClick={() => addNumber('whitelist')}
                                style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {config.whitelist.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Lista vacía</span>}
                            {config.whitelist.map(num => (
                                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}>
                                    <span>{num}</span>
                                    <button 
                                        onClick={() => removeNumber('whitelist', num)}
                                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Blacklist */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                            <Shield size={16} /> Blacklist
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input 
                                type="text" 
                                placeholder="Número a bloquear..." 
                                value={newNumber.type === 'blacklist' ? newNumber.value : ''}
                                onChange={(e) => setNewNumber({type: 'blacklist', value: e.target.value})}
                                style={{ flex: 1, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}
                                onKeyPress={(e) => e.key === 'Enter' && addNumber('blacklist')}
                            />
                            <button 
                                onClick={() => addNumber('blacklist')}
                                style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {config.blacklist.length === 0 && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Lista vacía</span>}
                            {config.blacklist.map(num => (
                                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}>
                                    <span>{num}</span>
                                    <button 
                                        onClick={() => removeNumber('blacklist', num)}
                                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Admins */}
                    <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EAB308' }}>
                            ⭐ Administradores
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input 
                                type="text" 
                                placeholder="Número admin..." 
                                value={newNumber.type === 'adminNumbers' ? newNumber.value : ''}
                                onChange={(e) => setNewNumber({type: 'adminNumbers', value: e.target.value})}
                                style={{ flex: 1, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}
                                onKeyPress={(e) => e.key === 'Enter' && addNumber('adminNumbers')}
                            />
                            <button 
                                onClick={() => addNumber('adminNumbers')}
                                style={{ background: '#EAB308', color: 'black', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {config.adminNumbers.map(num => (
                                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}>
                                    <span>{num}</span>
                                    <button 
                                        onClick={() => removeNumber('adminNumbers', num)}
                                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="pulse-glow" 
                onClick={handleSave}
                disabled={isSaving}
                style={{ 
                    background: '#25D366', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 24px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)'
                }}
              >
                <Save size={20} />
                {isSaving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
            ⚠️ No se pudo cargar la configuración de BotWA.
          </div>
        )}
      </div>
    </>
  )
}
