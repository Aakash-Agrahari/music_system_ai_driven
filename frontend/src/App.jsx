import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import InsightsPage from './pages/InsightsPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="spinner" style={{ width: 48, height: 48 }} /></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/search" /> : <LoginPage />} />
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/search' : '/login'} />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a26',
              color: '#f0f0ff',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: 12,
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1a1a26' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a26' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
