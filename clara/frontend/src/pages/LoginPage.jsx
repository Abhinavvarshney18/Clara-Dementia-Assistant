import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, HeartPulse, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { getApiError } from '../utils/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', form)
      login(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}.`)
      navigate(data.user.role === 'patient' ? '/dashboard' : '/caregiver')
    } catch (error) {
      toast.error(getApiError(error, 'Login failed. Please check your details.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-grid">
        <aside className="auth-story">
          <Link className="brand-lockup" to="/">
            <div className="brand-mark">
              <HeartPulse size={22} />
            </div>
            <div>
              <p className="brand-name">Clara</p>
              <p className="brand-subtitle">Care assistant</p>
            </div>
          </Link>
          <div>
            <h1>Welcome back.</h1>
            <p>Open your Clara workspace to check reminders, talk with Clara, and keep care details in one place.</p>
          </div>
          <p>Private by default. Built for simple daily routines.</p>
        </aside>

        <main className="auth-card">
          <p className="eyebrow">Account access</p>
          <h2>Sign in to Clara</h2>
          <p>Use the email and password you created for your patient or caregiver account.</p>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Email address</span>
              <span className="input-wrap">
                <Mail size={18} />
                <input
                  className="input with-icon"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Password</span>
              <span className="input-wrap">
                <Lock size={18} />
                <input
                  className="input with-icon"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-link">
            New to Clara? <Link to="/signup">Create an account</Link>
          </p>
          <Link className="back-link" to="/">Back to home</Link>
        </main>
      </div>
    </div>
  )
}
