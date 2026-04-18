import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MessageCircle, Bell, User,
  LogOut, Menu, X, Heart, Users, ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const patientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/chat',      icon: MessageCircle,  label: 'Talk to Clara' },
  { to: '/reminders', icon: Bell,           label: 'Reminders' },
  { to: '/profile',   icon: User,           label: 'My Profile' },
]

const caregiverNav = [
  { to: '/caregiver', icon: Users,          label: 'Dashboard' },
  { to: '/profile',   icon: User,           label: 'My Profile' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = user?.role === 'patient' ? patientNav : caregiverNav

  const handleLogout = () => {
    logout()
    toast.success('Goodbye! Take care 💙')
    navigate('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <span className="text-xl font-bold text-indigo-700">Clara</span>
            <p className="text-xs text-slate-400 leading-none mt-0.5">Dementia Assistant</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 bg-indigo-50 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`nav-item ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {location.pathname === to && <ChevronRight className="w-4 h-4 opacity-40" />}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button onClick={handleLogout} className="nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
  <div className="layout">

    {/* Sidebar */}
    <aside className="sidebar">
      <h2>Clara</h2>

      {navItems.map(({ to, label }) => (
        <Link key={to} to={to} className="nav-item">
          {label}
        </Link>
      ))}

      <button onClick={handleLogout} className="logout-btn">
        Sign Out
      </button>
    </aside>

    {/* Main content */}
    <main className="main">
      {children}
    </main>

  </div>
)
}