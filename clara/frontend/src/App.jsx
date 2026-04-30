import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientDashboard from './pages/PatientDashboard'
import CaregiverDashboard from './pages/CaregiverDashboard'
import ClaraChat from './pages/ClaraChat'
import RemindersPage from './pages/RemindersPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function homeFor(user) {
  return user?.role === 'caregiver' ? '/caregiver' : '/dashboard'
}

function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to={homeFor(user)} replace />
  }

  return children
}

function AppRoute({ children, role }) {
  return (
    <ProtectedRoute role={role}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to={homeFor(user)} replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={homeFor(user)} replace /> : <SignupPage />}
      />

      <Route
        path="/dashboard"
        element={<AppRoute role="patient"><PatientDashboard /></AppRoute>}
      />
      <Route
        path="/chat"
        element={<AppRoute role="patient"><ClaraChat /></AppRoute>}
      />
      <Route
        path="/reminders"
        element={<AppRoute role="patient"><RemindersPage /></AppRoute>}
      />
      <Route
        path="/profile"
        element={<AppRoute><ProfilePage /></AppRoute>}
      />
      <Route
        path="/caregiver"
        element={<AppRoute role="caregiver"><CaregiverDashboard /></AppRoute>}
      />

      <Route path="*" element={<Navigate to={user ? homeFor(user) : '/'} replace />} />
    </Routes>
  )
}
