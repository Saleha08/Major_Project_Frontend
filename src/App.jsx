import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './context/useApp.js'
import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import WorkspacePage from './pages/WorkspacePage.jsx'

function ProtectedRoute({ children }) {
  const { booting, token } = useApp()

  if (booting) {
    return (
      <div className="hero-gradient flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-6 py-5 text-sm text-soft">
          Loading CampusConnect...
        </div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={(
            <ProtectedRoute>
              <WorkspacePage />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
