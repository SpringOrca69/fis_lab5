import { Bell } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { unreadCount } from '@/data/selectors'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { OfflineBanner } from './OfflineBanner'
import { BottomNav } from './BottomNav'

interface Props {
  title: string
  children: ReactNode
  /** Hide the bottom nav, e.g. while the camera is active (Phase 3). */
  hideNav?: boolean
  /** Plain white page for calm result screens. */
  plain?: boolean
}

/** Header (title + bell), scrolling content, disclaimer footer, bottom nav. */
export function AppShell({ title, children, hideNav = false, plain = false }: Props) {
  const { t } = useI18n()
  const { state } = useStore()
  const unread = unreadCount(state)

  return (
    <div className={`mx-auto flex min-h-dvh max-w-[30rem] flex-col ${plain ? 'bg-surface' : 'bg-canvas'} shadow-card`}>
      <header className="print:static print:bg-white print:text-black sticky top-0 z-20 flex items-center justify-between gap-3 bg-brand-700 pt-[env(safe-area-inset-top)] pr-3 pl-5 text-white">
        <h1 className="py-3 text-title font-bold">{title}</h1>
        <Link
          to="/notifications"
          aria-label={unread > 0 ? `${t('header.notifications')}, ${t('header.unread', { count: unread })}` : t('header.notifications')}
          className="print:hidden relative flex size-tap items-center justify-center rounded-full hover:bg-brand-600"
        >
          <Bell aria-hidden className="size-6" />
          {unread > 0 && (
            <span
              aria-hidden
              className="absolute top-1 right-1 flex min-w-6 items-center justify-center rounded-full bg-white px-1 text-sm leading-6 font-bold text-brand-900"
            >
              {unread}
            </span>
          )}
        </Link>
      </header>

      <OfflineBanner />
      <main className="flex-1 px-5 py-5">{children}</main>

      <footer className="print:text-black px-5 pt-2 pb-4 text-center text-sm text-ink-muted">{t('app.disclaimer')}</footer>
      {!hideNav && <BottomNav />}
    </div>
  )
}
