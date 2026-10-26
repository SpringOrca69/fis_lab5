import { CheckCircle2, Download, Printer, Share2, TriangleAlert, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { DayPicker } from '@/components/report/DayPicker'
import { reportForDate } from '@/data/selectors'
import { useStore } from '@/data/storeContext'
import type { Transaction } from '@/data/types'
import { useI18n } from '@/i18n/context'
import { dateKey } from '@/lib/dates'
import { canShare, downloadCsv, shareReport } from '@/lib/exportReport'
import { formatCurrency, formatDate, formatTime } from '@/lib/format'
import { buildCsv, COLLAPSED_ROWS, filterByPeriod, isReportDate, PERIODS, reportDateKeys, type Period } from '@/lib/report'
import { cn } from '@/lib/utils'

export const REPORT_LOADING_MS = 400

/** Short artificial delay on the first report of the session so the skeleton state exists. */
let loadedOnce = false

function ReportSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-5" role="status">
      <span className="sr-only">{label}</span>
      <div className="h-14 animate-pulse rounded-control bg-line" aria-hidden />
      <div className="animate-pulse rounded-card bg-surface p-5 shadow-card" aria-hidden>
        <div className="h-5 w-40 rounded bg-line" />
        <div className="mt-3 h-12 w-48 rounded bg-line" />
        <div className="mt-4 h-5 w-56 rounded bg-line" />
      </div>
      <div className="h-16 animate-pulse rounded-control bg-line" aria-hidden />
      <div className="h-16 animate-pulse rounded-control bg-line" aria-hidden />
    </div>
  )
}

const actionBtn =
  'flex min-h-tap-pay items-center justify-center gap-2 rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-900'

/** Screen 5 and History: one screen for today and any of the last 14 days. */
export default function Report() {
  const { date } = useParams()
  const todayKey = dateKey(new Date())
  if (date !== undefined && !isReportDate(date)) return <Navigate to="/history" replace />
  return <ReportDay key={date ?? todayKey} day={date ?? todayKey} todayKey={todayKey} />
}

function ReportDay({ day, todayKey }: { day: string; todayKey: string }) {
  const { t, lang } = useI18n()
  const { state } = useStore()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('all')
  const [expanded, setExpanded] = useState(false)
  const isToday = day === todayKey
  const [loading, setLoading] = useState(!loadedOnce)
  useEffect(() => {
    if (!loading) return
    const id = window.setTimeout(() => {
      loadedOnce = true
      setLoading(false)
    }, REPORT_LOADING_MS)
    return () => window.clearTimeout(id)
  }, [loading])

  const report = useMemo(() => reportForDate(state, day), [state, day])
  const { reconciliation: rec } = report
  const shown = filterByPeriod(report.transactions, period)
  const visible = expanded ? shown : shown.slice(0, COLLAPSED_ROWS)
  const money = (n: number) => formatCurrency(n, lang)
  const missingIds = new Set(rec.missing.map((m) => m.id))

  const status = isToday
    ? { kind: 'scheduled' as const, text: t('home.paidTonight') }
    : rec.status === 'matched'
      ? { kind: 'matched' as const, text: t('report.status.matched') }
      : rec.status === 'not_matched'
        ? { kind: 'bad' as const, text: t('report.status.notMatched', { amount: money(rec.gap) }) }
        : { kind: 'none' as const, text: t('report.status.none') }

  const title = isToday ? t('report.today') : formatDate(day, lang)
  const csv = () => buildCsv(shown)
  const share = () =>
    shareReport({
      csv: csv(),
      dateKeyStr: day,
      title: t('report.shareTitle', { shop: state.merchant.name, date: formatDate(day, lang) }),
      text: `${t('report.shareTitle', { shop: state.merchant.name, date: formatDate(day, lang) })}\n${t('report.shareSummary', { total: money(report.total), count: t('home.payments', { count: report.count }) })}\n${status.text}`,
    })

  return (
    <AppShell title={title}>
      {loading ? (
        <ReportSkeleton label={t('report.loading')} />
      ) : (
      <div className="flex flex-col gap-5">
        <div className="hidden print:block">
          <p className="text-lg font-bold">{state.merchant.name}</p>
          <p>{state.merchant.address}</p>
          <p>{formatDate(day, lang)}</p>
        </div>

        <DayPicker
          keys={reportDateKeys()}
          value={day}
          onChange={(k) => navigate(k === todayKey ? '/history' : `/history/${k}`)}
        />

        <section aria-labelledby="sum-h" className="rounded-card bg-surface p-5 shadow-card">
          <h2 id="sum-h" className="text-lg font-bold">
            {t('report.sales')}
          </h2>
          <p className="mt-1 text-amount-xl font-bold text-brand-700" data-testid="report-total">
            {money(report.total)}
          </p>
          <p className="text-base font-bold" data-testid="report-count">
            {t('home.payments', { count: report.count })}
          </p>
          <p
            data-testid="report-status"
            className={cn(
              'mt-3 flex items-start gap-2 border-t border-line pt-3 text-base font-bold',
              status.kind === 'bad' ? 'text-danger' : status.kind === 'matched' ? 'text-success' : 'text-brand-900',
            )}
          >
            {status.kind === 'bad' ? (
              <TriangleAlert aria-hidden className="mt-0.5 size-6 shrink-0" />
            ) : status.kind === 'matched' ? (
              <CheckCircle2 aria-hidden className="mt-0.5 size-6 shrink-0" />
            ) : (
              <Wallet aria-hidden className="mt-0.5 size-6 shrink-0" />
            )}
            {status.text}
          </p>
        </section>

        {status.kind === 'bad' && (
          <section aria-labelledby="mm-h" className="rounded-card border-2 border-danger bg-danger-tint p-5" data-testid="mismatch">
            <h2 id="mm-h" className="text-lg font-bold text-danger">
              {t('report.mismatch.title')}
            </h2>
            <p className="mt-2 text-base">
              {t('report.mismatch.body', { expected: money(rec.expected), received: money(rec.received ?? 0), gap: money(rec.gap) })}
            </p>
            <p className="mt-2 text-base font-bold">
              {rec.missing.length ? t('report.mismatch.missing') : t('report.mismatch.unknown')}
            </p>
            {rec.missing.map((m) => (
              <p key={m.id} className="mt-1 text-lg font-bold">
                {formatTime(m.createdAt, lang)}, {money(m.amount)}
              </p>
            ))}
            <Link
              to="/help"
              className="mt-4 flex min-h-tap-pay items-center justify-center rounded-control bg-brand-700 px-4 text-lg font-bold text-white print:hidden"
            >
              {t('report.problem')}
            </Link>
          </section>
        )}

        <section aria-labelledby="list-h" className="flex flex-col gap-3">
          <h2 id="list-h" className="text-lg font-bold">
            {t('report.listTitle')}
          </h2>
          <div role="group" aria-label={t('report.filter.label')} className="flex flex-wrap gap-2 print:hidden">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => {
                  setPeriod(p)
                  setExpanded(false)
                }}
                className={cn(
                  'min-h-tap rounded-full border-2 px-4 text-base font-bold',
                  period === p ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-surface text-ink',
                )}
              >
                {t(`report.filter.${p}`)}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="rounded-card bg-surface p-5 shadow-card" data-testid="report-empty">
              <p className="text-base font-bold">{report.count === 0 ? t('report.empty') : t('report.emptyFilter')}</p>
              {report.count === 0 && <p className="text-base text-ink-muted">{t('report.emptyHint')}</p>}
            </div>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card" data-testid="payment-list">
              {shown.map((tx, i) => (
                <PaymentRow
                  key={tx.id}
                  tx={tx}
                  missing={missingIds.has(tx.id)}
                  className={i >= visible.length ? 'hidden print:flex' : undefined}
                />
              ))}
            </ul>
          )}

          {shown.length > COLLAPSED_ROWS && (
            <button type="button" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)} className={cn(actionBtn, 'print:hidden')}>
              {expanded ? t('report.showLess') : t('report.showAll', { count: shown.length })}
            </button>
          )}
        </section>

        <section aria-labelledby="exp-h" className="flex flex-col gap-3 print:hidden">
          <h2 id="exp-h" className="text-lg font-bold">
            {t('report.export.title')}
          </h2>
          <button type="button" className={actionBtn} onClick={() => downloadCsv(csv(), day)} disabled={shown.length === 0}>
            <Download aria-hidden className="size-6" />
            {t('report.download')}
          </button>
          {canShare() && (
            <button type="button" className={actionBtn} onClick={() => void share()}>
              <Share2 aria-hidden className="size-6" />
              {t('report.share')}
            </button>
          )}
          <button type="button" className={actionBtn} onClick={() => window.print()}>
            <Printer aria-hidden className="size-6" />
            {t('report.print')}
          </button>
        </section>
      </div>
      )}
    </AppShell>
  )
}

function PaymentRow({ tx, missing, className }: { tx: Transaction; missing: boolean; className?: string }) {
  const { t, lang } = useI18n()
  return (
    <li className={cn('flex min-h-tap-pay items-center justify-between gap-3 px-4 py-3', missing && 'bg-danger-tint', className)}>
      <div className="min-w-0">
        <p className="text-base font-bold">{formatTime(tx.createdAt, lang)}</p>
        {missing && (
          <p className="flex items-center gap-1 text-sm font-bold text-danger">
            <TriangleAlert aria-hidden className="size-4 shrink-0" />
            {t('report.mismatch.tag')}
          </p>
        )}
      </div>
      <p className="text-lg font-bold">{formatCurrency(tx.amount, lang)}</p>
    </li>
  )
}
