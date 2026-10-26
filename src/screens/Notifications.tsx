import { BellOff, CalendarCheck, CircleAlert, Lightbulb, Wallet, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { BackButton } from '@/components/BackButton'
import { unreadCount } from '@/data/selectors'
import { useStore } from '@/data/storeContext'
import type { Notification } from '@/data/types'
import { useI18n } from '@/i18n/context'
import type { TranslationKey } from '@/i18n/en'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Slot } from '@/lib/booking'

const ICONS: Record<Notification['type'], LucideIcon> = {
  payout: Wallet,
  mismatch: CircleAlert,
  tip: Lightbulb,
  booking: CalendarCheck,
}

/** Bell destination. Unread items have a dot, a "New" word and bold text. */
export default function Notifications() {
  const { t, lang } = useI18n()
  const { state, dispatch } = useStore()
  const unread = unreadCount(state)
  const items = [...state.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function message(n: Notification): string {
    const params: Record<string, string | number> = {}
    for (const [k, v] of Object.entries(n.params)) {
      if (k === 'date') params[k] = formatDate(String(v), lang)
      else if (k === 'amount') params[k] = formatCurrency(Number(v), lang)
      else if (k === 'slot') params[k] = t(`book.slot.${v as Slot}`)
      else params[k] = v
    }
    if (n.type === 'booking') params.station = t('book.stationName')
    return t(n.i18nKey as TranslationKey, params)
  }

  return (
    <AppShell title={t('notif.title')}>
      <BackButton />
      {items.length === 0 ? (
        <div data-testid="notif-empty" className="flex flex-col items-center rounded-card bg-surface p-8 text-center shadow-card">
          <BellOff aria-hidden className="size-12 text-ink-muted" />
          <p className="mt-3 text-lg font-bold">{t('notif.empty')}</p>
          <p className="text-base text-ink-muted">{t('notif.emptyHint')}</p>
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={unread === 0}
            onClick={() => dispatch({ type: 'markAllRead' })}
            className="mb-4 flex min-h-tap-pay w-full items-center justify-center rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700 disabled:border-line disabled:text-ink-muted"
          >
            {t('notif.markAll')}
          </button>
          <ul className="flex flex-col gap-3" data-testid="notif-list">
            {items.map((n) => {
              const Icon = ICONS[n.type]
              const date = typeof n.params.date === 'string' ? n.params.date : null
              const href = date && (n.type === 'payout' || n.type === 'mismatch') ? `/history/${date}` : null
              const body = (
                <>
                  <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-brand-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink-muted">{t(`notif.type.${n.type}`)}</span>
                    <span className={cn('block text-base', !n.read && 'font-bold')}>{message(n)}</span>
                  </span>
                  {!n.read && (
                    <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-brand-900" data-testid="unread-dot">
                      <span aria-hidden className="size-3 rounded-full bg-brand-700" />
                      {t('notif.new')}
                    </span>
                  )}
                </>
              )
              const cls = 'flex min-h-tap-pay items-start gap-3 rounded-control border-2 bg-surface p-3 ' + (n.read ? 'border-line' : 'border-brand-700')
              return (
                <li key={n.id}>
                  {href ? (
                    <Link to={href} className={cls}>
                      {body}
                    </Link>
                  ) : (
                    <div className={cls}>{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </AppShell>
  )
}
