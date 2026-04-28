import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SkeletonCard } from './components/ui.jsx'
import { useApp } from './context/useApp.js'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const WorkspacePage = lazy(() => import('./pages/WorkspacePage.jsx'))

function PageFallback() {
  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-4">
        <SkeletonCard />
        <p className="text-center text-sm text-slate-600">Loading…</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { booting, token } = useApp()

  if (booting) {
    return <PageFallback />
  }

  if (!token) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

export default App
