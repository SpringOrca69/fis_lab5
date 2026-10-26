import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { PayoutBadge } from '@/components/report/PayoutBadge'
import { useStore } from '@/data/storeContext'
import type { Payout } from '@/data/types'
import { useI18n } from '@/i18n/context'
import { dateKey } from '@/lib/dates'
import { formatCurrency, formatDate } from '@/lib/format'

/** Tonight's payout on top, then past payouts. Each opens that day's report. */
export default function Payouts() {
  const { t, lang } = useI18n()
  const { state } = useStore()
  const todayKey = dateKey(new Date())
  const sorted = [...state.payouts].sort((a, b) => b.date.localeCompare(a.date))
  const tonight = sorted.find((p) => p.date === todayKey)
  const past = sorted.filter((p) => p.date !== todayKey)
  const money = (n: number) => formatCurrency(n, lang)
  const href = (p: Payout) => (p.date === todayKey ? '/history' : `/history/${p.date}`)

  return (
    <AppShell title={t('payouts.title')}>
      <div className="flex flex-col gap-5">
        {tonight && (
          <section aria-labelledby="tonight-h">
            <Link
              to={href(tonight)}
              data-testid="payout-tonight"
              className="block rounded-card bg-surface p-5 shadow-card ring-2 ring-brand-700"
            >
              <h2 id="tonight-h" className="text-lg font-bold">
                {t('payouts.tonight')}
              </h2>
              <p className="mt-1 text-amount-xl font-bold text-brand-700">{money(tonight.expected)}</p>
              <div className="mt-2">
                <PayoutBadge status={tonight.status} />
              </div>
              <p className="mt-3 text-base font-bold text-brand-900">{t('home.paidTonight')}</p>
              <p className="flex items-center justify-between text-base text-ink-muted">
                {t('payouts.bank', { last4: state.merchant.bankLast4 })}
                <ChevronRight aria-hidden className="size-6" />
              </p>
              <span className="sr-only">{t('payouts.seeReport')}</span>
            </Link>
          </section>
        )}

        <section aria-labelledby="past-h" className="flex flex-col gap-3">
          <h2 id="past-h" className="text-lg font-bold">
            {t('payouts.past')}
          </h2>
          <ul className="flex flex-col gap-3">
            {past.map((p) => (
              <li key={p.id}>
                <Link
                  to={href(p)}
                  data-testid="payout-row"
                  className="flex min-h-tap-pay items-center gap-3 rounded-control border-2 border-line bg-surface px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold">{formatDate(p.date, lang)}</span>
                    <span className="mt-1 block">
                      <PayoutBadge status={p.status} />
                    </span>
                    {p.status === 'not_matched' && p.received !== undefined && (
                      <span className="mt-1 block text-base font-bold text-danger">
                        {t('payouts.short', { amount: money(p.expected - p.received) })}
                      </span>
                    )}
                  </span>
                  <span className="text-lg font-bold">{money(p.received ?? p.expected)}</span>
                  <ChevronRight aria-hidden className="size-6 shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  )
}
