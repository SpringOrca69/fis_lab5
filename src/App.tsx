import { RouterProvider } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import { StoreProvider } from './data/store'
import { I18nProvider } from './i18n/I18nProvider'
import { router } from './routes'

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <StoreProvider>
          <RouterProvider router={router} />
        </StoreProvider>
      </AuthProvider>
    </I18nProvider>
  )
}
