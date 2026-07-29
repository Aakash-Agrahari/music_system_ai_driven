import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import './LoginPage.css'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await authApi.login({ username: form.username, password: form.password })
      } else {
        res = await authApi.register({ username: form.username, email: form.email, password: form.password })
      }
      const { token, ...user } = res.data
      login(token, user)
      toast.success(`Welcome${mode === 'register' ? ' aboard' : ' back'}, ${user.username}! 🎵`)
      navigate('/search')
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
      </div>

      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon" style={{ width: 52, height: 52 }}>
            <Music2 size={26} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>SoundVault</h1>
          <p className="login-tagline">Your personal music library, powered by insights</p>
        </div>

        {/* Card */}
        <div className="login-card glass-panel">
          {/* Tabs */}
          <div className="login-tabs">
            <button
              id="tab-login"
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              className={`login-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="input"
                placeholder="your_username"
                value={form.username}
                onChange={e => update('username', e.target.value)}
                required
                minLength={3}
                autoComplete="username"
              />
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPassword(v => !v)}
                  id="toggle-password"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="submit-auth"
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '13px', fontSize: 15 }}
              disabled={loading}
            >
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="login-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              id={mode === 'login' ? 'go-to-register' : 'go-to-login'}
              className="switch-btn"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
