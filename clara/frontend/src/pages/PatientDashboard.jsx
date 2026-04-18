import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, LayoutDashboard, MessageCircle, Bell, User, LogOut, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import api from '../utils/api'

export default function PatientDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reminders, setReminders] = useState([])
  const [selectedMood, setSelectedMood] = useState(null)

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const { data } = await api.get('/reminders')
      setReminders(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const pending = reminders.filter(r => !r.completed).length
  const completed = reminders.filter(r => r.completed).length
  const moods = ['😊 Happy', '😌 Calm', '😰 Anxious', '😕 Confused', '😢 Sad']

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
      minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#f5f3ef'
    }}>

      {/* SIDEBAR */}
      <div style={{ background: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '32px 20px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '500', fontSize: '16px', marginBottom: '48px' }}>
          <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={14} color="#1a1a2e" fill="#1a1a2e" />
          </div>
          Clara
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <NavItem icon={<LayoutDashboard size={14} />} label="Home" path="/dashboard" active={true} />
          <NavItem icon={<MessageCircle size={14} />} label="Talk to Clara" path="/chat" />
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

      {/* MAIN */}
      <div style={{ padding: '40px 48px', overflowY: 'auto' }}>

        {/* Greeting */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            {greeting}
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: '#1a1a2e', fontWeight: '500' }}>
            Welcome back, {user?.name} 👋
          </div>
          <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>{today}</div>
        </div>

        {/* Emergency Alert */}
        <div style={{
          background: '#fff3cd', border: '1px solid #f5c842', borderRadius: '10px',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', color: '#856404', marginBottom: '28px', cursor: 'pointer'
        }}>
          <AlertTriangle size={14} />
          Emergency alert — tap to contact caregiver immediately
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Pending', value: pending, sub: 'reminders left', icon: <Clock size={14} color="#f5a623" /> },
            { label: 'Completed', value: completed, sub: 'done today', icon: <CheckCircle size={14} color="#4caf7d" /> },
            { label: 'Total today', value: reminders.length, sub: 'scheduled', icon: <Bell size={14} color="#888" /> },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #eee' }}>
              <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '500', color: '#1a1a2e' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Mood + Reminders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Mood */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', marginBottom: '16px' }}>
              How are you feeling?
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {moods.map(mood => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px',
                    border: `1.5px solid ${selectedMood === mood ? '#1a1a2e' : '#e0ddd8'}`,
                    background: selectedMood === mood ? '#1a1a2e' : 'white',
                    color: selectedMood === mood ? 'white' : '#666',
                    fontSize: '12px', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer'
                  }}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Reminders */}
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #eee' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Today's Reminders
              <span onClick={() => navigate('/reminders')} style={{ fontSize: '11px', color: '#888', cursor: 'pointer' }}>
                See all →
              </span>
            </div>
            {reminders.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#bbb', textAlign: 'center', padding: '20px 0' }}>
                No reminders for today
              </div>
            ) : (
              reminders.slice(0, 3).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.completed ? '#4caf7d' : '#f5a623', flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', color: '#444', flex: 1 }}>{r.title}</div>
                  <div style={{ fontSize: '11px', color: '#bbb' }}>{r.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Talk to Clara CTA */}
        <div style={{
          background: '#1a1a2e', borderRadius: '14px', padding: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>Talk to Clara</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>I'm here to listen and help anytime 💙</div>
          </div>
          <button
            onClick={() => navigate('/chat')}
            style={{
              padding: '10px 20px', background: 'white', color: '#1a1a2e',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontFamily: "'DM Sans', sans-serif", fontWeight: '500', cursor: 'pointer'
            }}
          >
            Start chatting →
          </button>
        </div>

      </div>
    </div>
  )
}
