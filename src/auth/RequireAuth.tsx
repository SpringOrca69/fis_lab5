import { Navigate, Outlet } from 'react-router'
import { useAuth } from './authContext'

/** Layout route: anything inside it redirects to the login screen when logged out. */
export function RequireAuth() {
  const { loggedIn } = useAuth()
  return loggedIn ? <Outlet /> : <Navigate to="/" replace />
}
