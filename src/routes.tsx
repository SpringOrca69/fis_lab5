import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import Home from './screens/Home'
import Demo from './screens/Demo'
import Login from './screens/Login'
import Pay from './screens/Pay'
import Placeholder from './screens/Placeholder'

/**
 * Everything except `/`, `/demo` and `/help` needs a login. Help stays open
 * because the "Singpass login trouble" path on the login screen links to it.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/demo', element: <Demo /> },
  { path: '/help', element: <Placeholder titleKey="common.getHelp" /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/pay', element: <Pay /> },
      { path: '/history', element: <Placeholder titleKey="nav.history" /> },
      { path: '/payouts', element: <Placeholder titleKey="nav.payout" /> },
      { path: '/stall', element: <Placeholder titleKey="nav.stall" /> },
      { path: '/notifications', element: <Placeholder titleKey="header.notifications" /> },
    ],
  },
])
