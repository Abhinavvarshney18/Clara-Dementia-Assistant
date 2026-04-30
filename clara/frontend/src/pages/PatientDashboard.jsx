import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Frown,
  HeartPulse,
  Meh,
  MessageCircle,
  Smile,
  SmilePlus,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { getApiError } from '../utils/api'

const moodOptions = [
  { value: 'happy', label: 'Happy', icon: SmilePlus },
  { value: 'calm', label: 'Calm', icon: Smile },
  { value: 'anxious', label: 'Anxious', icon: HeartPulse },
  { value: 'confused', label: 'Confused', icon: Meh },
  { value: 'sad', label: 'Sad', icon: Frown },
]

function formatTime(value) {
  if (!value) return 'Any time'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reminders, setReminders] = useState([])
  const [moods, setMoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState('')
  const [alerting, setAlerting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const [reminderRes, moodRes] = await Promise.all([
          api.get('/reminders/today'),
          api.get('/patient/mood'),
        ])
        if (!active) return
        setReminders(reminderRes.data)
        setMoods(moodRes.data)
      } catch (error) {
        toast.error(getApiError(error, 'Could not load dashboard data.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const done = reminders.filter((reminder) => reminder.is_completed).length
    return {
      total: reminders.length,
      done,
      pending: reminders.length - done,
    }
  }, [reminders])

  const logMood = async (mood) => {
    setSelectedMood(mood)
    try {
      await api.post('/patient/mood', { mood })
      toast.success('Mood saved for today.')
      const { data } = await api.get('/patient/mood')
      setMoods(data)
    } catch (error) {
      toast.error(getApiError(error, 'Could not save mood.'))
    }
  }

  const completeReminder = async (reminderId) => {
    try {
      await api.put(`/reminders/${reminderId}/complete`)
      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === reminderId ? { ...reminder, is_completed: 1 } : reminder,
        ),
      )
      toast.success('Reminder completed.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not update reminder.'))
    }
  }

  const sendEmergencyAlert = async () => {
    setAlerting(true)
    try {
      await api.post('/patient/emergency', {
        message: `${user?.name || 'Patient'} needs help from a caregiver.`,
      })
      toast.success('Emergency alert sent to caregiver.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not send alert.'))
    } finally {
      setAlerting(false)
    }
  }

  const recentMood = moods[0]?.mood || selectedMood || 'not logged'

  return (
    <div className="page-stack">
      <section className="page-head">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Hello, {user?.name?.split(' ')[0] || 'friend'}.</h2>
          <p>
            Your care plan for today is ready. Check your reminders, save how you feel,
            and open Clara whenever you need a calm conversation.
          </p>
        </div>
        <button className="button danger" type="button" onClick={sendEmergencyAlert} disabled={alerting}>
          <AlertTriangle size={17} />
          {alerting ? 'Sending...' : 'Emergency alert'}
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Pending</p>
            <div className="metric-icon coral"><Clock size={20} /></div>
          </div>
          <p className="metric-value">{loading ? '-' : stats.pending}</p>
          <p className="empty-copy">Reminders still open today.</p>
        </article>

        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Completed</p>
            <div className="metric-icon"><CheckCircle2 size={20} /></div>
          </div>
          <p className="metric-value">{loading ? '-' : stats.done}</p>
          <p className="empty-copy">Tasks finished with Clara.</p>
        </article>

        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Mood</p>
            <div className="metric-icon blue"><Sparkles size={20} /></div>
          </div>
          <p className="metric-value" style={{ fontSize: '1.7rem', textTransform: 'capitalize' }}>
            {recentMood}
          </p>
          <p className="empty-copy">Latest feeling check-in.</p>
        </article>
      </section>

      <section className="summary-grid">
        <article className="panel">
          <div className="stat-head">
            <div>
              <p className="card-kicker">Reminders</p>
              <h3>Next items today</h3>
            </div>
            <button className="button ghost" type="button" onClick={() => navigate('/reminders')}>
              View all
            </button>
          </div>

          {loading ? (
            <p className="empty-copy">Loading reminders...</p>
          ) : reminders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Bell size={24} /></div>
              <p className="empty-title">No reminders yet</p>
              <p className="empty-copy">Add a reminder so Clara can help guide the day.</p>
            </div>
          ) : (
            reminders.slice(0, 5).map((reminder) => (
              <div className="row" key={reminder.id}>
                <span className={`dot ${reminder.is_completed ? 'done' : ''}`} />
                <div className="row-main">
                  <strong>{reminder.title}</strong>
                  <span>{reminder.description || reminder.type}</span>
                </div>
                <span className="row-time">{formatTime(reminder.scheduled_time)}</span>
                {!reminder.is_completed && (
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => completeReminder(reminder.id)}
                    aria-label={`Complete ${reminder.title}`}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </article>

        <article className="panel">
          <div>
            <p className="card-kicker">Feeling check</p>
            <h3>How are you feeling?</h3>
          </div>

          <div className="mood-grid">
            {moodOptions.map((mood) => {
              const MoodIcon = mood.icon
              return (
                <button
                  key={mood.value}
                  className={`mood-button ${selectedMood === mood.value || moods[0]?.mood === mood.value ? 'active' : ''}`}
                  type="button"
                  onClick={() => logMood(mood.value)}
                >
                  <MoodIcon size={22} />
                  <span>{mood.label}</span>
                </button>
              )
            })}
          </div>

          <div className="care-callout">
            <p className="card-kicker">Clara</p>
            <h3>Need someone to talk to?</h3>
            <p>Clara can help with reassurance, reminders, orientation, and simple next steps.</p>
            <button className="button blue" type="button" onClick={() => navigate('/chat')}>
              <MessageCircle size={17} />
              Talk to Clara
            </button>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="stat-head">
          <div>
            <p className="card-kicker">Daily plan</p>
            <h3>Recommended focus</h3>
          </div>
          <CalendarCheck size={24} color="#176b5b" />
        </div>
        <div className="action-row">
          <span className="tag">Take medicines on time</span>
          <span className="tag blue">Drink water regularly</span>
          <span className="tag coral">Call caregiver if worried</span>
        </div>
      </section>
    </div>
  )
}
