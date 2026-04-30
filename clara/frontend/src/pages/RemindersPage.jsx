import { useEffect, useMemo, useState } from 'react'
import {
  AlarmClock,
  Bell,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Pill,
  Plus,
  Trash2,
  Utensils,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api, { getApiError } from '../utils/api'

const reminderTypes = [
  { value: 'medicine', label: 'Medicine', icon: Pill },
  { value: 'meal', label: 'Meal', icon: Utensils },
  { value: 'appointment', label: 'Appointment', icon: CalendarPlus },
  { value: 'exercise', label: 'Exercise', icon: CheckCircle2 },
  { value: 'task', label: 'Task', icon: Bell },
]

const initialForm = {
  title: '',
  type: 'medicine',
  scheduled_time: '',
  repeat_type: 'none',
  description: '',
}

function formatDateTime(value) {
  if (!value) return 'Not scheduled'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReminderModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState(initialForm)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="new-reminder-title">
        <div className="modal-head">
          <div>
            <p className="eyebrow">New reminder</p>
            <h2 id="new-reminder-title">Add care task</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              className="input"
              name="title"
              placeholder="Morning medicine"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <div className="form-grid">
            <label className="field">
              <span className="field-label">Type</span>
              <select className="select" name="type" value={form.type} onChange={handleChange}>
                {reminderTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
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
            <textarea
              className="textarea"
              name="description"
              placeholder="Add dose, location, or caregiver notes."
              value={form.description}
              onChange={handleChange}
            />
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

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')

  const loadReminders = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reminders')
      setReminders(data)
    } catch (error) {
      toast.error(getApiError(error, 'Could not load reminders.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [])

  const counts = useMemo(() => ({
    all: reminders.length,
    pending: reminders.filter((reminder) => !reminder.is_completed).length,
    completed: reminders.filter((reminder) => reminder.is_completed).length,
  }), [reminders])

  const filteredReminders = reminders.filter((reminder) => {
    if (filter === 'pending') return !reminder.is_completed
    if (filter === 'completed') return reminder.is_completed
    return true
  })

  const addReminder = async (form) => {
    setSaving(true)
    try {
      const { data } = await api.post('/reminders', form)
      setReminders((current) => [...current, data].sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time)))
      setShowModal(false)
      toast.success('Reminder added.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not add reminder.'))
    } finally {
      setSaving(false)
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
      toast.success('Reminder marked complete.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not complete reminder.'))
    }
  }

  const deleteReminder = async (reminderId) => {
    try {
      await api.delete(`/reminders/${reminderId}`)
      setReminders((current) => current.filter((reminder) => reminder.id !== reminderId))
      toast.success('Reminder deleted.')
    } catch (error) {
      toast.error(getApiError(error, 'Could not delete reminder.'))
    }
  }

  return (
    <div className="page-stack">
      <section className="page-head">
        <div>
          <p className="eyebrow">Daily care</p>
          <h2>Reminders</h2>
          <p>Create medicine, meal, appointment, exercise, and task reminders for Clara to track.</p>
        </div>
        <button className="button primary" type="button" onClick={() => setShowModal(true)}>
          <Plus size={17} />
          Add reminder
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">All</p>
            <div className="metric-icon blue"><AlarmClock size={20} /></div>
          </div>
          <p className="metric-value">{counts.all}</p>
          <p className="empty-copy">Total scheduled reminders.</p>
        </article>
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Pending</p>
            <div className="metric-icon coral"><Clock size={20} /></div>
          </div>
          <p className="metric-value">{counts.pending}</p>
          <p className="empty-copy">Still waiting today.</p>
        </article>
        <article className="metric-card">
          <div className="stat-head">
            <p className="card-kicker">Completed</p>
            <div className="metric-icon"><CheckCircle2 size={20} /></div>
          </div>
          <p className="metric-value">{counts.completed}</p>
          <p className="empty-copy">Finished reminders.</p>
        </article>
      </section>

      <section className="panel">
        <div className="stat-head">
          <div>
            <p className="card-kicker">Schedule</p>
            <h3>Care timeline</h3>
          </div>
          <div className="tabs">
            {['all', 'pending', 'completed'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={filter === tab ? 'active' : ''}
                onClick={() => setFilter(tab)}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="empty-copy">Loading reminders...</p>
        ) : filteredReminders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell size={24} /></div>
            <p className="empty-title">No reminders in this view</p>
            <p className="empty-copy">Add one to start building the care timeline.</p>
          </div>
        ) : (
          <div className="reminder-list">
            {filteredReminders.map((reminder) => {
              const typeMeta = reminderTypes.find((type) => type.value === reminder.type) || reminderTypes[4]
              const Icon = typeMeta.icon
              return (
                <article className={`reminder-item ${reminder.is_completed ? 'done' : ''}`} key={reminder.id}>
                  <button
                    className={`check-button ${reminder.is_completed ? 'done' : ''}`}
                    type="button"
                    disabled={Boolean(reminder.is_completed)}
                    onClick={() => completeReminder(reminder.id)}
                    aria-label={`Complete ${reminder.title}`}
                  >
                    {reminder.is_completed ? <Check size={17} /> : <Icon size={17} />}
                  </button>

                  <div className="row-main">
                    <strong>{reminder.title}</strong>
                    <span>{reminder.description || 'No extra details added.'}</span>
                  </div>

                  <span className={`category-pill ${reminder.type}`}>
                    {typeMeta.label}
                  </span>

                  <div className="action-row">
                    <span className="row-time">{formatDateTime(reminder.scheduled_time)}</span>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => deleteReminder(reminder.id)}
                      aria-label={`Delete ${reminder.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {showModal && (
        <ReminderModal
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={addReminder}
        />
      )}
    </div>
  )
}
