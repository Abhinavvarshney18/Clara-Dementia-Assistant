import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api, { getApiError } from '../utils/api'

const reminderTypes = ['medicine', 'meal', 'appointment', 'exercise', 'task']

function formatDate(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function CaregiverReminderModal({ patient, onClose, onSave }) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'medicine',
    scheduled_time: '',
    repeat_type: 'none',
    description: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave({ ...form, patient_id: patient.id })
      toast.success(`Reminder added for ${patient.name}.`)
      onClose()
    } catch (error) {
      toast.error(getApiError(error, 'Could not add reminder.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="caregiver-reminder-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Caregiver reminder</p>
            <h2 id="caregiver-reminder-title">{patient.name}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Title</span>
            <input className="input" name="title" value={form.title} onChange={handleChange} required />
          </label>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Type</span>
              <select className="select" name="type" value={form.type} onChange={handleChange}>
                {reminderTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Repeat</span>
              <select className="select" name="repeat_type" value={form.repeat_type} onChange={handleChange}>
                <option value="none">Once</option>
                <option value="daily">Every day</option>
                <option value="weekly">Every week</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span className="field-label">Date and time</span>
            <input
              className="input"
              type="datetime-local"
              name="scheduled_time"
              value={form.scheduled_time}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Details</span>
            <textarea className="textarea" name="description" value={form.description} onChange={handleChange} />
          </label>
          <div className="form-actions">
            <button className="button ghost" type="button" onClick={onClose}>Cancel</button>
            <button className="button primary" type="submit" disabled={saving}>
              <Plus size={17} />
              {saving ? 'Saving...' : 'Save reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PatientCard({ patient }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reminders, setReminders] = useState([])
  const [moods, setMoods] = useState([])
  const [alerts, setAlerts] = useState([])
  const [activity, setActivity] = useState([])
  const [showReminder, setShowReminder] = useState(false)

  const unresolvedAlerts = alerts.filter((alert) => !alert.is_resolved)
  const completedCount = reminders.filter((reminder) => reminder.is_completed).length

  const loadPatientData = async () => {
    if (expanded || loading) {
      setExpanded((value) => !value)
      return
    }

    setExpanded(true)
    setLoading(true)
    try {
      const [reminderRes, moodRes, alertRes, activityRes] = await Promise.all([
        api.get(`/reminders/today?patientId=${patient.id}`),
        api.get(`/patient/mood?patientId=${patient.id}`),
        api.get(`/patient/alerts?patientId=${patient.id}`),
        api.get(`/patient/activity-log?patientId=${patient.id}`),
      ])
      setReminders(reminderRes.data)
      setMoods(moodRes.data)
      setAlerts(alertRes.data)
      setActivity(activityRes.data)
    } catch (error) {
      toast.error(getApiError(error, `Could not load ${patient.name}.`))
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/patient/alerts/${alertId}/resolve`)
      setAlerts((current) => current.map((alert) => (
        alert.id === alertId ? { ...alert, is_resolved: 1 } : alert
      )))
      toast.success('Alert resolved.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not resolve alert.'))
    }
  }

  const saveReminder = async (payload) => {
    const { data } = await api.post('/reminders', payload)
    setReminders((current) => [data, ...current])
  }

  return (
    <article className="patient-card">
      <div className="patient-card-top">
        <button className="patient-head" type="button" onClick={loadPatientData} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
          <div className="avatar">{patient.name.charAt(0).toUpperCase()}</div>
          <div>
            <h3>{patient.name}</h3>
            <p className="empty-copy">{patient.email}</p>
          </div>
        </button>
        <div className="action-row">
          {unresolvedAlerts.length > 0 && (
            <span className="tag coral">
              <AlertTriangle size={15} />
              {unresolvedAlerts.length} alert
            </span>
          )}
          <button className="button ghost" type="button" onClick={() => setShowReminder(true)}>
            <Plus size={16} />
            Add reminder
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {loading ? (
            <p className="empty-copy">Loading patient details...</p>
          ) : (
            <>
              <div className="patient-details">
                <div className="mini-card">
                  <p className="mini-label">Reminders today</p>
                  <strong>{reminders.length}</strong>
                </div>
                <div className="mini-card">
                  <p className="mini-label">Completed</p>
                  <strong>{completedCount}</strong>
                </div>
                <div className="mini-card">
                  <p className="mini-label">Latest mood</p>
                  <strong style={{ textTransform: 'capitalize' }}>{moods[0]?.mood || 'Not logged'}</strong>
                </div>
              </div>

              {unresolvedAlerts.length > 0 && (
                <div className="alert-box">
                  <strong>Open alerts</strong>
                  {unresolvedAlerts.map((alert) => (
                    <div className="row" key={alert.id}>
                      <AlertTriangle size={18} />
                      <div className="row-main">
                        <strong>{alert.message}</strong>
                        <span>{formatDate(alert.created_at)}</span>
                      </div>
                      <button className="button ghost" type="button" onClick={() => resolveAlert(alert.id)}>
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="summary-grid">
                <div className="mini-card">
                  <p className="mini-label">Today reminders</p>
                  {reminders.length === 0 ? (
                    <p className="empty-copy">No reminders today.</p>
                  ) : reminders.slice(0, 4).map((reminder) => (
                    <div className="row" key={reminder.id}>
                      {reminder.is_completed ? <CheckCircle2 size={18} color="#176b5b" /> : <Clock size={18} color="#d99b31" />}
                      <div className="row-main">
                        <strong>{reminder.title}</strong>
                        <span>{formatDate(reminder.scheduled_time)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mini-card">
                  <p className="mini-label">Recent activity</p>
                  {activity.length === 0 ? (
                    <p className="empty-copy">No activity yet.</p>
                  ) : activity.slice(0, 5).map((item) => (
                    <div className="row" key={item.id}>
                      <ShieldCheck size={18} color="#176b5b" />
                      <div className="row-main">
                        <strong>{item.action.replace(/_/g, ' ')}</strong>
                        <span>{formatDate(item.logged_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {showReminder && (
        <CaregiverReminderModal
          patient={patient}
          onClose={() => setShowReminder(false)}
          onSave={saveReminder}
        />
      )}
    </article>
  )
}

export default function CaregiverDashboard() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadPatients() {
      try {
        const { data } = await api.get('/patient/all')
        if (active) setPatients(data)
      } catch (error) {
        toast.error(getApiError(error, 'Could not load patient list.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPatients()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => ({
    patients: patients.length,
    active: patients.length > 0 ? 'Active' : 'Ready',
  }), [patients])

  return (
    <div className="page-stack">
      <section className="page-head">
        <div>
          <p className="eyebrow">Caregiver</p>
          <h2>Care team dashboard</h2>
          <p>Monitor patient reminders, mood check-ins, alerts, and activity from one caregiver view.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Patients</p>
            <div className="metric-icon blue"><Users size={20} /></div>
          </div>
          <p className="metric-value">{stats.patients}</p>
          <p className="empty-copy">Patient accounts in Clara.</p>
        </article>
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">System</p>
            <div className="metric-icon"><ShieldCheck size={20} /></div>
          </div>
          <p className="metric-value" style={{ fontSize: '1.7rem' }}>{stats.active}</p>
          <p className="empty-copy">Backend and caregiver APIs are connected.</p>
        </article>
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Support</p>
            <div className="metric-icon coral"><Bell size={20} /></div>
          </div>
          <p className="metric-value">24/7</p>
          <p className="empty-copy">Clara chat is available for patients.</p>
        </article>
      </section>

      <section className="panel">
        <div>
          <p className="card-kicker">Patients</p>
          <h3>Your patient list</h3>
        </div>

        {loading ? (
          <p className="empty-copy">Loading patients...</p>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Users size={24} /></div>
            <p className="empty-title">No patient accounts yet</p>
            <p className="empty-copy">Patient accounts will appear here after they sign up in Clara.</p>
          </div>
        ) : (
          <div className="patient-list">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
