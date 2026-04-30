import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse, Lock, Mail, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { getApiError } from '../utils/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.post('/auth/signup', form)
      login(data.user, data.token)
      toast.success(`Welcome to Clara, ${data.user.name}.`)
      navigate(data.user.role === 'patient' ? '/dashboard' : '/caregiver')
    } catch (error) {
      toast.error(getApiError(error, 'Signup failed. Please try again.'))
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
            <h1>Build a calmer care routine.</h1>
            <p>Create a patient workspace for reminders and Clara chat, or join as a caregiver to monitor patients.</p>
          </div>
          <p>One project. Two roles. A clearer daily care flow.</p>
        </aside>

        <main className="auth-card">
          <p className="eyebrow">Create account</p>
          <h2>Start with Clara</h2>
          <p>Choose the role that matches how you will use the care workspace.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <span className="field-label">I am joining as</span>
              <div className="role-toggle" role="group" aria-label="Account role">
                {['patient', 'caregiver'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={form.role === role ? 'active' : ''}
                    onClick={() => setForm((current) => ({ ...current, role }))}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span className="field-label">Full name</span>
              <span className="input-wrap">
                <UserRound size={18} />
                <input
                  className="input with-icon"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </span>
            </label>

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
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="6"
                  required
                />
              </span>
            </label>

            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-link">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
          <Link className="back-link" to="/">Back to home</Link>
        </main>
      </div>
    </div>
  )
}
