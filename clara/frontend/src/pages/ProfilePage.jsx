import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Heart, LayoutDashboard, MessageCircle, Bell, User, LogOut, Edit2, Save, X } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    date_of_birth: '', diagnosis_date: '', blood_group: '',
    address: '', doctor_name: '', doctor_phone: '',
    allergies: '', medications: '', emergency_contact_name: '', emergency_contact_phone: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile')
      if (data) setProfile(prev => ({ ...prev, ...data }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    try {
      await api.put('/profile', profile)
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error('Failed to save profile.')
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

  const Field = ({ label, field }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
        {label}
      </label>
      {editing ? (
        <input
          value={profile[field] || ''}
          onChange={e => setProfile({ ...profile, [field]: e.target.value })}
          style={{
            width: '100%', padding: '10px 14px',
            border: '1.5px solid #e0ddd8', borderRadius: '8px',
            fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
            background: '#f5f3ef', color: '#1a1a2e', outline: 'none'
          }}
        />
      ) : (
        <div style={{ fontSize: '14px', color: profile[field] ? '#1a1a2e' : '#bbb', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
          {profile[field] || 'Not provided'}
        </div>
      )}
    </div>
  )

  const Section = ({ title, children }) => (
    <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #eee', marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
        {title}
      </div>
      {children}
    </div>
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
          <NavItem icon={<LayoutDashboard size={14} />} label="Home" path="/dashboard" />
          <NavItem icon={<MessageCircle size={14} />} label="Talk to Clara" path="/chat" />
          <NavItem icon={<Bell size={14} />} label="Reminders" path="/reminders" />
          <NavItem icon={<User size={14} />} label="My Profile" path="/profile" active={true} />
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#999', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Account
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: '#1a1a2e', fontWeight: '500' }}>
              My Profile
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    padding: '9px 18px', border: '1.5px solid #e0ddd8', borderRadius: '8px',
                    background: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                    color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '9px 18px', border: 'none', borderRadius: '8px',
                    background: '#1a1a2e', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Save size={13} /> Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: '9px 18px', border: '1.5px solid #1a1a2e', borderRadius: '8px',
                  background: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                  color: '#1a1a2e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Edit2 size={13} /> Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Avatar Card */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #eee', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: '#1a1a2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', color: 'white', fontWeight: '500', flexShrink: 0
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#1a1a2e' }}>{user?.name}</div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{user?.email}</div>
            <div style={{
              display: 'inline-block', marginTop: '8px', padding: '3px 10px',
              background: '#f0f8f4', border: '1px solid #c8e6d4', borderRadius: '20px',
              fontSize: '11px', color: '#2e7d52', textTransform: 'capitalize'
            }}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Field label="Date of Birth" field="date_of_birth" />
            <Field label="Diagnosis Date" field="diagnosis_date" />
            <Field label="Blood Group" field="blood_group" />
            <Field label="Address" field="address" />
          </div>
        </Section>

        {/* Medical Info */}
        <Section title="Medical Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Field label="Doctor Name" field="doctor_name" />
            <Field label="Doctor Phone" field="doctor_phone" />
            <Field label="Allergies" field="allergies" />
            <Field label="Current Medications" field="medications" />
          </div>
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Field label="Contact Name" field="emergency_contact_name" />
            <Field label="Contact Phone" field="emergency_contact_phone" />
          </div>
        </Section>

      </div>
    </div>
  )
}
