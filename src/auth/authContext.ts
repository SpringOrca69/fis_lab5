import { createContext, useContext } from 'react'

export interface AuthValue {
  loggedIn: boolean
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const v = useContext(AuthContext)
  if (!v) throw new Error('useAuth must be used inside AuthProvider')
  return v
}
