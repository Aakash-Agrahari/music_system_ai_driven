import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Music2, Search, BookOpen, BarChart3, Sparkles, LogOut } from 'lucide-react'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/insights', icon: Sparkles, label: 'AI Insights' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/search" className="navbar-logo">
          <div className="logo-icon">
            <Music2 size={20} />
          </div>
          <span className="logo-text gradient-text">SoundVault</span>
        </Link>

        {/* Nav links */}
        <ul className="navbar-links">
          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`nav-link ${location.pathname === to ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* User */}
        <div className="navbar-user">
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span className="user-name">{user?.username}</span>
          <button onClick={logout} className="btn btn-ghost btn-icon" title="Logout" id="logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
