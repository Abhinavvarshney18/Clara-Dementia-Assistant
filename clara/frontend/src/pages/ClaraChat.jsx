import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, LayoutDashboard, MessageCircle, Bell, User, LogOut, Send } from 'lucide-react'
import api from '../utils/api'

export default function ClaraChat() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || ''}! I'm Clara, your AI companion. How are you feeling today? 💙`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const { data } = await api.post('/clara/chat', {
        message: input,
        history: messages
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const NavItem = ({ icon, label, path, active }) => (
    <button
      onClick={() => navigate(path)}
      style={{
        padding: '10px 14px', borderRadius: '8px',
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: active ? 'white' : 'rgba(255,255,255,0.5)',
        fontSize: '13px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '10px',
        border: 'none', fontFamily: "'DM Sans', sans-serif",
        width: '100%', marginBottom: '4px', textAlign: 'left'
      }}
    >
      {icon} {label}
    </button>
  )

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '220px 1fr',
      height: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f5f3ef'
    }}>

      {/* SIDEBAR */}
      <div style={{ background: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '500', fontSize: '16px', marginBottom: '48px' }}>
          <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={14} color="#1a1a2e" fill="#1a1a2e" />
          </div>
          Clara
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <NavItem icon={<LayoutDashboard size={14} />} label="Home" path="/dashboard" />
          <NavItem icon={<MessageCircle size={14} />} label="Talk to Clara" path="/chat" active={true} />
          <NavItem icon={<Bell size={14} />} label="Reminders" path="/reminders" />
          <NavItem icon={<User size={14} />} label="My Profile" path="/profile" />
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(192,57,43,0.15)', color: '#e74c3c',
            fontSize: '13px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px',
            border: 'none', fontFamily: "'DM Sans', sans-serif", width: '100%'
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* CHAT AREA */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Header */}
        <div style={{
          padding: '20px 32px', background: 'white',
          borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '36px', height: '36px', background: '#1a1a2e',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={14} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a2e' }}>Clara</div>
            <div style={{ fontSize: '11px', color: '#4caf7d' }}>● Online — always here for you</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px', height: '28px', background: '#1a1a2e',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end'
                }}>
                  <Heart size={12} color="white" fill="white" />
                </div>
              )}
              <div style={{
                maxWidth: '65%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? '#1a1a2e' : 'white',
                color: msg.role === 'user' ? 'white' : '#1a1a2e',
                fontSize: '14px', lineHeight: '1.6',
                border: msg.role === 'assistant' ? '1px solid #eee' : 'none'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', background: '#1a1a2e',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Heart size={12} color="white" fill="white" />
              </div>
              <div style={{
                padding: '12px 16px', background: 'white', borderRadius: '18px 18px 18px 4px',
                border: '1px solid #eee', fontSize: '14px', color: '#aaa'
              }}>
                Clara is typing...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px 32px', background: 'white',
          borderTop: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'center'
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              flex: 1, padding: '12px 16px', border: '1.5px solid #e0ddd8',
              borderRadius: '24px', fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif", outline: 'none',
              background: '#f5f3ef', color: '#1a1a2e'
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: input.trim() ? '#1a1a2e' : '#e0ddd8',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s'
            }}
          >
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}
