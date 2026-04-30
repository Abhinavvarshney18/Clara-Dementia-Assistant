import { useEffect, useState } from 'react'
import { Edit2, Save, ShieldCheck, UserRound, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api, { getApiError } from '../utils/api'

const emptyProfile = {
  date_of_birth: '',
  diagnosis_date: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  doctor_name: '',
  doctor_phone: '',
  address: '',
  blood_group: '',
  allergies: '',
  current_medications: '',
  notes: '',
}

const sections = [
  {
    title: 'Personal details',
    fields: [
      { label: 'Date of birth', field: 'date_of_birth', type: 'date' },
      { label: 'Diagnosis date', field: 'diagnosis_date', type: 'date' },
      { label: 'Blood group', field: 'blood_group' },
      { label: 'Address', field: 'address' },
    ],
  },
  {
    title: 'Medical details',
    fields: [
      { label: 'Doctor name', field: 'doctor_name' },
      { label: 'Doctor phone', field: 'doctor_phone' },
      { label: 'Allergies', field: 'allergies' },
      { label: 'Current medications', field: 'current_medications' },
    ],
  },
  {
    title: 'Emergency contact',
    fields: [
      { label: 'Contact name', field: 'emergency_contact_name' },
      { label: 'Contact phone', field: 'emergency_contact_phone' },
      { label: 'Care notes', field: 'notes' },
    ],
  },
]

function ProfileField({ label, field, type = 'text', editing, profile, onChange }) {
  const value = profile[field] || ''

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {editing ? (
        <input
          className="input"
          type={type}
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
        />
      ) : (
        <span className={`field-value ${value ? '' : 'empty'}`}>
          {value || 'Not added yet'}
        </span>
      )}
    </label>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(emptyProfile)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(user?.role === 'patient')
  const isPatient = user?.role === 'patient'

  useEffect(() => {
    let active = true

    async function loadProfile() {
      if (!isPatient) return

      setLoading(true)
      try {
        const { data } = await api.get('/patient/profile')
        if (active) setProfile({ ...emptyProfile, ...(data.profile || {}) })
      } catch (error) {
        toast.error(getApiError(error, 'Could not load profile.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [isPatient])

  const updateField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const saveProfile = async () => {
    try {
      await api.put('/patient/profile', profile)
      toast.success('Profile updated.')
      setEditing(false)
    } catch (error) {
      toast.error(getApiError(error, 'Could not save profile.'))
    }
  }

  return (
    <div className="page-stack">
      <section className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h2>Profile</h2>
          <p>
            Keep key care information ready for Clara and caregivers. Patient medical fields are visible only on patient accounts.
          </p>
        </div>
      </section>

      <section className="profile-hero card">
        <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'C'}</div>
        <div>
          <h3>{user?.name}</h3>
          <p className="empty-copy">{user?.email}</p>
          <span className="role-pill">{user?.role}</span>
        </div>
        <ShieldCheck size={28} color="#176b5b" />
      </section>

      {!isPatient ? (
        <section className="panel">
          <div className="empty-state">
            <div className="empty-icon"><UserRound size={24} /></div>
            <p className="empty-title">Caregiver account</p>
            <p className="empty-copy">
              Your caregiver dashboard shows patient activity and reminders. Patient medical profiles are managed from patient accounts.
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className="action-row" style={{ justifyContent: 'flex-end' }}>
            {editing ? (
              <>
                <button className="button ghost" type="button" onClick={() => setEditing(false)}>
                  <X size={17} />
                  Cancel
                </button>
                <button className="button primary" type="button" onClick={saveProfile}>
                  <Save size={17} />
                  Save profile
                </button>
              </>
            ) : (
              <button className="button ghost" type="button" onClick={() => setEditing(true)}>
                <Edit2 size={17} />
                Edit profile
              </button>
            )}
          </div>

          {loading ? (
            <section className="panel">
              <p className="empty-copy">Loading profile...</p>
            </section>
          ) : (
            sections.map((section) => (
              <section className="panel" key={section.title}>
                <div>
                  <p className="card-kicker">Patient profile</p>
                  <h3>{section.title}</h3>
                </div>
                <div className="profile-grid">
                  {section.fields.map((field) => (
                    <ProfileField
                      key={field.field}
                      {...field}
                      editing={editing}
                      profile={profile}
                      onChange={updateField}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </>
      )}
    </div>
  )
}
