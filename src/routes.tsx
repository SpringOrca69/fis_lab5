import { createBrowserRouter } from 'react-router'
import Foundations from './screens/Foundations'
import Placeholder from './screens/Placeholder'

export const router = createBrowserRouter([
  { path: '/', element: <Foundations /> },
  { path: '/home', element: <Foundations /> },
  { path: '/pay', element: <Placeholder titleKey="nav.pay" /> },
  { path: '/history', element: <Placeholder titleKey="nav.history" /> },
  { path: '/payouts', element: <Placeholder titleKey="nav.payout" /> },
  { path: '/stall', element: <Placeholder titleKey="nav.stall" /> },
  { path: '/notifications', element: <Placeholder titleKey="header.notifications" /> },
])
