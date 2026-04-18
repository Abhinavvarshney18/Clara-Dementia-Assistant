import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PatientDashboard from './pages/PatientDashboard'
import CaregiverDashboard from './pages/CaregiverDashboard'
import ClaraChat from './pages/ClaraChat'
import RemindersPage from './pages/RemindersPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'
import './App.css'

function ProtectedRoute({ children, role }) {
  const { user, isLoggedIn } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'patient' ? '/dashboard' : '/caregiver'} replace />
  }
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'patient' ? '/dashboard' : '/caregiver'} /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'patient' ? '/dashboard' : '/caregiver'} /> : <SignupPage />} />

      {/* Patient routes */}
      <Route path="/dashboard" element={
        
          <Layout><PatientDashboard /></Layout>
        
      } />
      <Route path="/chat" element={
        <ProtectedRoute role="patient">
          <Layout><ClaraChat /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/reminders" element={
        
          <Layout><RemindersPage /></Layout>
        
      } />
      <Route path="/profile" element={
        
          <Layout><ProfilePage /></Layout>
        
      } />

      {/* Caregiver routes */}
      <Route path="/caregiver" element={
        
          <Layout><CaregiverDashboard /></Layout>
        
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}