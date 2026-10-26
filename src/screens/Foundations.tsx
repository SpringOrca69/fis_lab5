import { AppShell } from '@/components/AppShell'
import { lastTransaction, todayTotal, todayTransactions, reportForDate } from '@/data/selectors'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { dateKey, addDays } from '@/lib/dates'
import { formatCurrency, formatTime, LANGS } from '@/lib/format'
import { MISMATCH_DAYS_AGO } from '@/data/seed'
import { cn } from '@/lib/utils'

/** Phase 1 stub: proves seed + selectors + language switching. Replaced by Login/Home in Phase 2. */
export default function Foundations() {
  const { t, lang, setLang } = useI18n()
  const { state, resetDemo } = useStore()
  const now = new Date()
  const total = todayTotal(state, now)
  const count = todayTransactions(state, now).length
  const last = lastTransaction(state, now)
  const mismatch = reportForDate(state, dateKey(addDays(now, -MISMATCH_DAYS_AGO))).reconciliation

  return (
    <AppShell title={t('foundations.title')}>
      <div className="flex flex-col gap-5">
        <section className="rounded-card bg-surface p-5 shadow-card">
          <p className="text-base text-ink-muted">{t('foundations.todaySales')}</p>
          <p className="text-amount-xl font-bold text-brand-700">{formatCurrency(total, lang)}</p>
          <p className="text-base">{t('foundations.payments', { count })}</p>
          <p className="mt-3 text-base">
            {last
              ? `${t('foundations.lastPayment')}: ${formatTime(last.createdAt, lang)} (${formatCurrency(last.amount, lang)})`
              : t('foundations.noPayments')}
          </p>
          <p className="mt-1 text-base font-bold">{t('foundations.paidTonight')}</p>
          <p className="mt-3 text-sm text-ink-muted">
            {state.merchant.name}, {state.merchant.address} ({state.merchant.id}, {state.merchant.deviceId})
          </p>
          <p className="mt-3 inline-block rounded-control bg-warning-tint px-3 py-1 text-sm font-bold text-warning">
            {t('foundations.mismatchDay', { amount: formatCurrency(mismatch.gap, lang) })}
          </p>
        </section>

        <section aria-labelledby="lang-h">
          <h2 id="lang-h" className="mb-2 text-lg font-bold">
            {t('lang.label')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  'min-h-tile rounded-control border-2 px-3 text-lg font-bold',
                  lang === l ? 'border-brand-700 bg-brand-100 text-brand-900' : 'border-line bg-surface',
                )}
              >
                {t(`lang.${l}`)}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={resetDemo}
          className="min-h-tap rounded-control border-2 border-brand-700 bg-surface px-4 font-bold text-brand-700"
        >
          {t('foundations.resetDemo')}
        </button>
      </div>
    </AppShell>
  )
}
