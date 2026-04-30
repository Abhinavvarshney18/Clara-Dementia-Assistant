import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const patientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat', icon: MessageCircle, label: 'Clara Chat' },
  { to: '/reminders', icon: Bell, label: 'Reminders' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const caregiverNav = [
  { to: '/caregiver', icon: Users, label: 'Care Team' },
  { to: '/profile', icon: User, label: 'Profile' },
]

function Sidebar({ user, navItems, onNavigate, onLogout }) {
  return (
    <aside className="app-sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <HeartPulse size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="brand-name">Clara</p>
          <p className="brand-subtitle">Care assistant</p>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'C'}</div>
        <div>
          <p>{user?.name}</p>
          <span>{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const NavIcon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <NavIcon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="privacy-chip">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>Private care workspace</span>
        </div>
        <button className="sidebar-link logout-link" type="button" onClick={onLogout}>
          <LogOut size={18} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = user?.role === 'caregiver' ? caregiverNav : patientNav
  const firstName = user?.name?.split(' ')[0] || 'there'

  const handleLogout = () => {
    logout()
    toast.success('Signed out. Take care.')
    navigate('/')
  }

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        navItems={navItems}
        onNavigate={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`mobile-sidebar ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <button
          className="icon-button mobile-close"
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <Sidebar
          user={user}
          navItems={navItems}
          onNavigate={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      <div className="app-main">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">Welcome, {firstName}</p>
            <h1>{location.pathname === '/chat' ? 'Talk to Clara' : 'Care dashboard'}</h1>
          </div>
          <div className="status-pill">Backend ready</div>
        </header>

        <main className="content-area">{children}</main>
      </div>
    </div>
  )
}
