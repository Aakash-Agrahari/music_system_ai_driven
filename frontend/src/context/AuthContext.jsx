import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sv_token')
    const userData = localStorage.getItem('sv_user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem('sv_token')
        localStorage.removeItem('sv_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('sv_token', token)
    localStorage.setItem('sv_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sv_token')
    localStorage.removeItem('sv_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
