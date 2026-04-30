import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', form)
      login(data.user, data.token)
      toast.success(`Welcome to Clara, ${data.user.name}!`)
      navigate(data.user.role === 'patient' ? '/dashboard' : '/caregiver')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left Panel */}
      <div style={{
        background: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'white',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Heart size={16} color="#1a1a2e" fill="#1a1a2e" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '500', letterSpacing: '0.5px' }}>Clara</span>
        </div>

        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: '38px',
          lineHeight: '1.25',
          marginBottom: '20px',
          fontWeight: '500',
          maxWidth: '340px'
        }}>
          Care that connects, every single day.
        </div>

        <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', maxWidth: '320px' }}>
          Helping patients and caregivers stay in sync — with reminders, updates, and compassion built in.
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '50px' }}>
          <div style={{ width: '24px', height: '8px', borderRadius: '4px', background: 'white' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        background: '#f5f3ef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ fontSize: '26px', fontWeight: '500', color: '#1a1a2e', marginBottom: '6px' }}>
            Create your account
          </div>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '32px' }}>
            Join Clara — it's free and takes 30 seconds.
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
            {['patient', 'caregiver'].map(role => (
              <button
                key={role}
                onClick={() => setForm({ ...form, role })}
                style={{
                  padding: '10px',
                  border: `1.5px solid ${form.role === role ? '#1a1a2e' : '#e0ddd8'}`,
                  borderRadius: '10px',
                  background: 'white',
                  fontSize: '13px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: form.role === role ? '#1a1a2e' : '#888',
                  cursor: 'pointer',
                  fontWeight: form.role === role ? '500' : '400',
                  textTransform: 'capitalize'
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Fields */}
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@email.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'At least 6 characters' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', fontSize: '11px', color: '#888',
                marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase'
              }}>
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1.5px solid #e0ddd8', borderRadius: '10px',
                  fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
                  background: 'white', color: '#1a1a2e', outline: 'none'
                }}
              />
            </div>
          ))}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#555' : '#1a1a2e',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
              fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px', letterSpacing: '0.3px'
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1a1a2e', fontWeight: '500', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Link to="/" style={{ fontSize: '13px', color: '#aaa', textDecoration: 'none' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
