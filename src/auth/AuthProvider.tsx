import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './authContext'

export const AUTH_KEY = 'heartpay:auth'

function load(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

/** Mock session: a flag in localStorage. No real Singpass. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(load)
  const set = useCallback((v: boolean) => {
    setLoggedIn(v)
    try {
      if (v) localStorage.setItem(AUTH_KEY, '1')
      else localStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignore */
    }
  }, [])
  const login = useCallback(() => set(true), [set])
  const logout = useCallback(() => set(false), [set])
  const value = useMemo(() => ({ loggedIn, login, logout }), [loggedIn, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
