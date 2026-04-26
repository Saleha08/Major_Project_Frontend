import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import AppContext from './app-context.js'

const STORAGE_KEY = 'campusconnect-session'

function readSession() {
  if (typeof window === 'undefined') {
    return { token: '', user: null }
  }

  const savedSession = window.localStorage.getItem(STORAGE_KEY)

  if (!savedSession) {
    return { token: '', user: null }
  }

  try {
    return JSON.parse(savedSession)
  } catch {
    return { token: '', user: null }
  }
}

export function AppProvider({ children }) {
  const session = readSession()
  const [token, setToken] = useState(session.token || '')
  const [user, setUser] = useState(session.user || null)
  const [booting] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  useEffect(() => {
    if (!token || !user) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
  }, [token, user])

  useEffect(() => {
    if (!token) {
      return
    }

    api.get('/auth/me', { token })
      .then((response) => {
        const currentUser = response.data?.user || null
        if (currentUser) {
          setUser(currentUser)
        }
      })
      .catch(() => {
        logout()
      })
  }, [token])

  function persistSession(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
  }

  function logout() {
    setToken('')
    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AppContext.Provider
      value={{
        api,
        booting,
        logout,
        persistSession,
        token,
        user,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
