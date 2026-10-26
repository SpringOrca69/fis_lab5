import { RouterProvider } from 'react-router'
import { StoreProvider } from './data/store'
import { I18nProvider } from './i18n/I18nProvider'
import { router } from './routes'

export default function App() {
  return (
    <I18nProvider>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </I18nProvider>
  )
}
