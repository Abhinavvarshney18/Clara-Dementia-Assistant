import { useState, useEffect } from 'react'
import { Users, Bell, AlertTriangle, Activity, Plus, CheckCircle2, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { format } from 'date-fns'

const TYPE_ICONS = { medicine: '💊', meal: '🍽️', task: '✅', appointment: '🏥', exercise: '🏃' }
const MOOD_EMOJIS = { happy: '😊', calm: '😌', anxious: '😰', confused: '😕', sad: '😢' }

function AddReminderModal({ patientId, patientName, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', type: 'medicine', scheduled_time: '', repeat_type: 'none', description: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ ...form, patient_id: patientId })
      onClose()
      toast.success(`Reminder added for ${patientName}!`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add Reminder</h2>
            <p className="text-slate-500 text-sm">For: <span className="font-medium text-indigo-600">{patientName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Reminder title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['medicine', 'meal', 'task', 'appointment', 'exercise'].map(t => (
                <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date & Time *</label>
            <input className="input" type="datetime-local" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} required />
          </div>
          <div>
            <label className="label">Repeat</label>
            <select className="input" value={form.repeat_type} onChange={e => setForm({ ...form, repeat_type: e.target.value })}>
              <option value="none">Once</option>
              <option value="daily">Every Day</option>
              <option value="weekly">Every Week</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Add Reminder'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PatientCard({ patient }) {
  const [reminders, setReminders] = useState([])
  const [moodLogs, setMoodLogs] = useState([])
  const [alerts, setAlerts] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const loadPatientData = async () => {
    if (dataLoaded) return
    try {
      const [remRes, moodRes, alertRes, logRes] = await Promise.all([
        api.get(`/reminders/today?patientId=${patient.id}`),
        api.get(`/patient/mood?patientId=${patient.id}`),
        api.get(`/patient/alerts?patientId=${patient.id}`),
        api.get(`/patient/activity-log?patientId=${patient.id}`)
      ])
      setReminders(remRes.data)
      setMoodLogs(moodRes.data.slice(0, 5))
      setAlerts(alertRes.data.filter(a => !a.is_resolved))
      setActivityLog(logRes.data.slice(0, 5))
      setDataLoaded(true)
    } catch {
      toast.error(`Could not load data for ${patient.name}`)
    }
  }

  const toggle = () => {
    if (!expanded) loadPatientData()
    setExpanded(!expanded)
  }

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/patient/alerts/${alertId}/resolve`)
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      toast.success('Alert resolved.')
    } catch {
      toast.error('Could not resolve alert.')
    }
  }

  const saveReminder = async (form) => {
    const { data } = await api.post('/reminders', form)
    setReminders(prev => [data, ...prev])
  }

  const unresolvedAlerts = alerts.length

  return (
    <div className={`card transition-all ${unresolvedAlerts > 0 ? 'border-red-200 bg-red-50/30' : ''}`}>
      <button onClick={toggle} className="w-full text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
              {patient.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800">{patient.name}</p>
              <p className="text-sm text-slate-500">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unresolvedAlerts > 0 && (
              <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" /> {unresolvedAlerts}
              </span>
            )}
            <span className={`text-slate-400 text-xl transition-transform ${expanded ? 'rotate-180' : ''}`}>⌄</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
          {/* Emergency alerts */}
          {unresolvedAlerts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-bold text-red-700 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" /> Emergency Alerts
              </h4>
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 mb-2 border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-red-700">{alert.message}</p>
                    <p className="text-xs text-slate-400">{format(new Date(alert.created_at), 'MMM d, h:mm a')}</p>
                  </div>
                  <button onClick={() => resolveAlert(alert.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent mood */}
          {moodLogs.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5 text-sm">Recent Moods</h4>
              <div className="flex flex-wrap gap-2">
                {moodLogs.map(m => (
                  <div key={m.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm">
                    <span className="text-base">{MOOD_EMOJIS[m.mood]}</span>
                    <span className="text-slate-600 capitalize">{m.mood}</span>
                    <span className="text-slate-400 text-xs">{format(new Date(m.logged_at), 'MMM d')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's reminders */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-500" /> Today's Reminders ({reminders.length})
              </h4>
              <button
                onClick={() => setShowAddReminder(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {reminders.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">No reminders today.</p>
            ) : (
              <div className="space-y-2">
                {reminders.map(r => (
                  <div key={r.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border
                    ${r.is_completed ? 'bg-green-50 border-green-100' : 'bg-white border-slate-200'}`}>
                    <span>{TYPE_ICONS[r.type]}</span>
                    <span className={`flex-1 ${r.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{r.title}</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />{format(new Date(r.scheduled_time), 'h:mm a')}
                    </span>
                    {r.is_completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity log */}
          {activityLog.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-700 mb-2 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-500" /> Recent Activity
              </h4>
              <div className="space-y-1.5">
                {activityLog.map(log => (
                  <div key={log.id} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full flex-shrink-0" />
                    <span className="text-slate-600 capitalize">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400 text-xs ml-auto">{format(new Date(log.logged_at), 'MMM d, h:mm a')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showAddReminder && (
        <AddReminderModal
          patientId={patient.id}
          patientName={patient.name}
          onClose={() => setShowAddReminder(false)}
          onSave={saveReminder}
        />
      )}
    </div>
  )
}

export default function CaregiverDashboard() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/patient/all')
      .then(({ data }) => setPatients(data))
      .catch(() => toast.error('Could not load patient list.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> Caregiver Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Monitor and support your patients</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card text-center py-5">
          <p className="text-3xl font-bold text-indigo-600">{patients.length}</p>
          <p className="text-slate-500 text-sm mt-1">Total Patients</p>
        </div>
        <div className="card text-center py-5">
          <p className="text-3xl font-bold text-green-600">Active</p>
          <p className="text-slate-500 text-sm mt-1">System Status</p>
        </div>
        <div className="card text-center py-5 col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold text-purple-600">24/7</p>
          <p className="text-slate-500 text-sm mt-1">Clara Available</p>
        </div>
      </div>

      {/* Patient list */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Your Patients</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="flex gap-3">
                  <div className="w-11 h-11 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 card">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-slate-600 font-medium text-lg">No patients yet</p>
            <p className="text-slate-400 text-sm mt-1">Patients will appear here once they register as patients.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}