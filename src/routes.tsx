import { createBrowserRouter } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import Home from './screens/Home'
import Demo from './screens/Demo'
import Login from './screens/Login'
import Pay from './screens/Pay'
import PaymentFailed from './screens/PaymentFailed'
import PaymentSuccess from './screens/PaymentSuccess'
import Payouts from './screens/Payouts'
import Report from './screens/Report'
import BookAmbassador from './screens/BookAmbassador'
import Help from './screens/Help'
import Notifications from './screens/Notifications'
import Stall from './screens/Stall'

/**
 * Everything except `/`, `/demo` and `/help` needs a login. Help stays open
 * because the "Singpass login trouble" path on the login screen links to it.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Login /> },
  { path: '/demo', element: <Demo /> },
  { path: '/help', element: <Help /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/pay', element: <Pay /> },
      { path: '/pay/success/:txId', element: <PaymentSuccess /> },
      { path: '/pay/failed', element: <PaymentFailed /> },
      { path: '/history', element: <Report /> },
      { path: '/history/:date', element: <Report /> },
      { path: '/payouts', element: <Payouts /> },
      { path: '/help/book', element: <BookAmbassador /> },
      { path: '/stall', element: <Stall /> },
      { path: '/notifications', element: <Notifications /> },
    ],
  },
])
