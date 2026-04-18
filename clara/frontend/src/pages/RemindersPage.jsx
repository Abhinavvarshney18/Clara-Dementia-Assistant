import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Heart, LayoutDashboard, MessageCircle, Bell, User,
  LogOut, Plus, X, Check, Clock, Trash2, AlarmClock
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Medication', 'Appointment', 'Activity', 'Meal', 'Other']

const SAMPLE = [
  { id: 1, title: 'Morning medication', time: '08:00', category: 'Medication', done: false, note: 'Donepezil 10mg with water' },
  { id: 2, title: 'Doctor visit – Dr. Sharma', time: '11:30', category: 'Appointment', done: false, note: 'AIIMS OPD, Block 3' },
  { id: 3, title: 'Evening walk', time: '17:00', category: 'Activity', done: true, note: '20 minutes in the garden' },
]

export default function RemindersPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [reminders, setReminders] = useState(SAMPLE)
  const [tab, setTab] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', time: '', category: 'Medication', note: '' })

  const filtered = reminders.filter(r =>
    tab === 'all' ? true : tab === 'pending' ? !r.done : r.done
  )

  const counts = {
    all: reminders.length,
    pending: reminders.filter(r => !r.done).length,
    done: reminders.filter(r => r.done).length,
  }

  const toggleDone = id => setReminders(prev =>
    prev.map(r => r.id === id ? { ...r, done: !r.done } : r)
  )

  const deleteReminder = id => {
    setReminders(prev => prev.filter(r => r.id !== id))
    toast.success('Reminder removed')
  }

  const addReminder = () => {
    if (!form.title || !form.time) { toast.error('Title and time are required'); return }
    setReminders(prev => [...prev, { ...form, id: Date.now(), done: false }])
    setForm({ title: '', time: '', category: 'Medication', note: '' })
    setShowForm(false)
    toast.success('Reminder added!')
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

  const categoryColor = c => ({
    Medication: { bg: '#fef3e2', border: '#fbd38d', text: '#92610a' },
    Appointment: { bg: '#ebf4ff', border: '#bee3f8', text: '#2b6cb0' },
    Activity:   { bg: '#f0fff4', border: '#c6f6d5', text: '#276749' },
    Meal:       { bg: '#fff5f5', border: '#fed7d7', text: '#9b2c2c' },
    Other:      { bg: '#f7fafc', border: '#e2e8f0', text: '#4a5568' },
  }[c] || { bg: '#f7fafc', border: '#e2e8f0', text: '#4a5568' })

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
          <NavItem icon={<LayoutDashboard size={14} />} label="Home" path="/dashboard" />
          <NavItem icon={<MessageCircle size={14} />} label="Talk to Clara" path="/chat" />
          <NavItem icon={<Bell size={14} />} label="Reminders" path="/reminders" active={true} />
          <NavItem icon={<User size={14} />} label="My Profile" path="/profile" />
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Daily care
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: '#1a1a2e', fontWeight: '500' }}>
              Reminders
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '9px 18px', border: 'none', borderRadius: '8px',
                background: '#1a1a2e', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Plus size={13} /> Add reminder
            </button>
          </div>
        </div>

        {/* Add Reminder Form Card */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #eee', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>New reminder</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Morning medication"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', border: '1.5px solid #e0ddd8', borderRadius: '8px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#f5f3ef', color: '#1a1a2e', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', border: '1.5px solid #e0ddd8', borderRadius: '8px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#f5f3ef', color: '#1a1a2e', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1.5px solid #e0ddd8', borderRadius: '8px',
                    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                    background: '#f5f3ef', color: '#1a1a2e', outline: 'none'
                  }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>Note (optional)</label>
                <input
                  type="text"
                  placeholder="Any extra details…"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                    border: '1.5px solid #e0ddd8', borderRadius: '8px',
                    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                    background: '#f5f3ef', color: '#1a1a2e', outline: 'none'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1.5px solid #e0ddd8', borderRadius: '8px', background: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={13} /> Cancel
              </button>
              <button onClick={addReminder} style={{ padding: '9px 18px', border: 'none', borderRadius: '8px', background: '#1a1a2e', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={13} /> Save reminder
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs + List Card */}
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #eee', overflow: 'hidden' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '4px', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', flex: 1 }}>All reminders</div>
            {['all', 'pending', 'done'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  border: tab === t ? '1px solid #1a1a2e' : '1px solid #e0ddd8',
                  background: tab === t ? '#1a1a2e' : 'white',
                  color: tab === t ? 'white' : '#888',
                  textTransform: 'capitalize'
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)} <span style={{ opacity: .7 }}>({counts[t]})</span>
              </button>
            ))}
          </div>

          {/* Reminder rows */}
          <div style={{ padding: '8px 0' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb' }}>
                <AlarmClock size={28} style={{ margin: '0 auto 12px', display: 'block', opacity: .4 }} />
                <div style={{ fontSize: '14px' }}>No reminders here</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>Add a reminder to get started</div>
              </div>
            ) : filtered.map((r, i) => {
              const cc = categoryColor(r.category)
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 24px',
                    borderBottom: i < filtered.length - 1 ? '1px solid #f5f3ef' : 'none',
                    opacity: r.done ? 0.55 : 1,
                    transition: 'opacity .2s'
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDone(r.id)}
                    style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      border: r.done ? 'none' : '1.5px solid #d0ccc6',
                      background: r.done ? '#1a1a2e' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {r.done && <Check size={11} color="white" strokeWidth={3} />}
                  </button>

                  {/* Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '56px', flexShrink: 0 }}>
                    <Clock size={11} color="#aaa" />
                    <span style={{ fontSize: '12px', color: '#999' }}>{r.time}</span>
                  </div>

                  {/* Title + note */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', color: '#1a1a2e', textDecoration: r.done ? 'line-through' : 'none', fontWeight: '500' }}>
                      {r.title}
                    </div>
                    {r.note && (
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.note}
                      </div>
                    )}
                  </div>

                  {/* Category pill */}
                  <div style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                    background: cc.bg, border: `1px solid ${cc.border}`, color: cc.text,
                    flexShrink: 0, whiteSpace: 'nowrap'
                  }}>
                    {r.category}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteReminder(r.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', padding: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                    onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary footer card */}
        {reminders.length > 0 && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '16px 24px', border: '1px solid #eee', marginTop: '16px', display: 'flex', gap: '32px' }}>
            {[
              { label: 'Total reminders', value: counts.all },
              { label: 'Pending', value: counts.pending },
              { label: 'Completed', value: counts.done },
              { label: 'Completion rate', value: counts.all ? `${Math.round((counts.done / counts.all) * 100)}%` : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a2e', fontFamily: 'Georgia, serif' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
