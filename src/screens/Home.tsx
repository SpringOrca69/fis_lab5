import { ChevronRight, ClipboardList, LifeBuoy, QrCode, Wallet, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { lastTransaction, todayTotal, todayTransactions } from '@/data/selectors'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { formatCurrency, formatTime } from '@/lib/format'

export const HOME_LOADING_MS = 500

/** Short artificial delay on first load of the session so the skeleton state exists. */
let loadedOnce = false

function Skeleton() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <div className="animate-pulse rounded-card bg-surface p-5 shadow-card" aria-hidden>
        <div className="h-5 w-40 rounded bg-line" />
        <div className="mt-3 h-12 w-48 rounded bg-line" />
        <div className="mt-4 h-5 w-56 rounded bg-line" />
        <div className="mt-3 h-5 w-64 rounded bg-line" />
      </div>
      <div className="h-28 animate-pulse rounded-card bg-brand-200" aria-hidden />
      <div className="h-14 animate-pulse rounded-control bg-line" aria-hidden />
      <div className="h-14 animate-pulse rounded-control bg-line" aria-hidden />
    </div>
  )
}

function LinkRow({ to, Icon, title, hint }: { to: string; Icon: LucideIcon; title: string; hint: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-tap-pay items-center gap-3 rounded-control border-2 border-line bg-surface px-4 py-2"
    >
      <Icon aria-hidden className="size-6 shrink-0 text-brand-700" />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold">{title}</span>
        <span className="block text-sm text-ink-muted">{hint}</span>
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0 text-ink-muted" />
    </Link>
  )
}

/** Screen 2. Four blocks only: sales, Accept CDC Payment, report link, help link. */
export default function Home() {
  const { t, lang } = useI18n()
  const { state } = useStore()
  const [loading, setLoading] = useState(!loadedOnce)

  useEffect(() => {
    if (!loading) return
    const id = window.setTimeout(() => {
      loadedOnce = true
      setLoading(false)
    }, HOME_LOADING_MS)
    return () => window.clearTimeout(id)
  }, [loading])

  const now = new Date()
  const total = todayTotal(state, now)
  const count = todayTransactions(state, now).length
  const last = lastTransaction(state, now)

  return (
    <AppShell title={t('home.title')}>
      {loading ? (
        <>
          <span className="sr-only">{t('home.loading')}</span>
          <Skeleton />
        </>
      ) : (
        <div className="flex flex-col gap-5">
          <section aria-labelledby="sales-h" className="rounded-card bg-surface p-5 shadow-card">
            <p className="text-sm text-ink-muted">{state.merchant.name}</p>
            <h2 id="sales-h" className="text-lg font-bold">
              {t('home.todaySales')}
            </h2>
            <p className="mt-1 text-amount-xl font-bold text-brand-700" data-testid="today-total">
              {formatCurrency(total, lang)}
            </p>
            <p className="text-base font-bold" data-testid="today-count">
              {t('home.payments', { count })}
            </p>
            {last ? (
              <p className="mt-3 text-base" data-testid="last-payment">
                {t('home.lastPayment')}: {formatTime(last.createdAt, lang)}, {formatCurrency(last.amount, lang)}
              </p>
            ) : (
              <div className="mt-3 rounded-control bg-brand-50 p-3" data-testid="empty-state">
                <p className="text-base font-bold">{t('home.noPayments')}</p>
                <p className="text-base text-ink-muted">{t('home.noPaymentsHint')}</p>
              </div>
            )}
            <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-base font-bold text-brand-900">
              <Wallet aria-hidden className="size-5 shrink-0" />
              {t('home.paidTonight')}
            </p>
          </section>

          <Link
            to="/pay"
            className="flex min-h-28 items-center gap-4 rounded-card bg-brand-700 px-5 py-4 text-white shadow-card"
          >
            <span aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-control bg-white/15">
              <QrCode className="size-10" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-title font-bold">{t('home.accept')}</span>
              <span className="block text-base text-brand-100">{t('home.acceptHint')}</span>
            </span>
            <ChevronRight aria-hidden className="size-7 shrink-0" />
          </Link>

          <div className="flex flex-col gap-3">
            <LinkRow to="/history" Icon={ClipboardList} title={t('home.report')} hint={t('home.reportHint')} />
            <LinkRow to="/help" Icon={LifeBuoy} title={t('home.help')} hint={t('home.helpHint')} />
          </div>
        </div>
      )}
    </AppShell>
  )
}
