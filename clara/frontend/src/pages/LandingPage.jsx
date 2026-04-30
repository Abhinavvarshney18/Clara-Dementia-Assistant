import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react'

const features = [
  {
    icon: Bell,
    title: 'Daily reminders',
    copy: 'Medication, meals, hydration, appointments, and small routines stay visible in one calm timeline.',
  },
  {
    icon: MessageCircle,
    title: 'Clara companion',
    copy: 'Patients get gentle conversation, reassurance, and simple next steps when the day feels confusing.',
  },
  {
    icon: Users,
    title: 'Caregiver view',
    copy: 'Families can follow reminders, mood updates, alerts, and recent activity without crowding the patient screen.',
  },
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <Link className="brand-lockup" to="/" aria-label="Clara home">
          <div className="brand-mark">
            <HeartPulse size={22} />
          </div>
          <div>
            <p className="brand-name">Clara</p>
            <p className="brand-subtitle" style={{ color: '#697586' }}>Dementia care assistant</p>
          </div>
        </Link>

        <div className="landing-actions">
          <Link className="button ghost" to="/login">Sign in</Link>
          <Link className="button primary" to="/signup">
            Get started
            <ArrowRight size={17} />
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <span className="tag">Built for everyday care</span>
          <h1>Clara</h1>
          <p>
            A calm digital companion for people living with dementia and the family members who care for them.
            Clara brings reminders, conversation, profiles, and caregiver updates into a simple daily workspace.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/signup">
              Create free account
              <ArrowRight size={17} />
            </Link>
            <Link className="button ghost" to="/login">Open my workspace</Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="Clara care overview preview">
          <div className="hero-badge">
            <ShieldCheck size={22} />
            <strong>Designed for clear routines</strong>
            <p>Large actions, patient language, caregiver context, and fewer distractions.</p>
          </div>

          <div className="care-card">
            <h2>Today with Ramesh</h2>
            <div className="care-row">
              <div className="care-icon"><Bell size={18} /></div>
              <div>
                <strong>Morning medicine</strong>
                <span>Donepezil with water</span>
              </div>
              <time>8:00</time>
            </div>
            <div className="care-row">
              <div className="care-icon"><CalendarCheck size={18} /></div>
              <div>
                <strong>Doctor visit</strong>
                <span>OPD, Block 3</span>
              </div>
              <time>11:30</time>
            </div>
            <div className="care-row">
              <div className="care-icon"><MessageCircle size={18} /></div>
              <div>
                <strong>Clara check-in</strong>
                <span>Feeling calm today</span>
              </div>
              <time>15:00</time>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head">
          <p className="eyebrow">Care features</p>
          <h2>A project that feels useful, not just decorative.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const FeatureIcon = feature.icon
            return (
              <article className="feature-card" key={feature.title}>
                <FeatureIcon size={30} />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Bring the patient and caregiver experience together.</h2>
        <Link className="button ghost" to="/signup">
          Start Clara
          <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  )
}
