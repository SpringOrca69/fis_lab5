import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { playSuccess } from '@/lib/feedback'
import { formatCurrency, formatDate, formatTime } from '@/lib/format'

/** Screen 4a: calm, white, one big tick. Chime and buzz play once on arrival. */
export default function PaymentSuccess() {
  const { t, lang } = useI18n()
  const { txId } = useParams()
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const played = useRef(false)
  const tx = state.transactions.find((x) => x.id === txId)
  const { soundOn, hapticsOn } = state.settings

  useEffect(() => {
    if (!tx || played.current) return
    played.current = true
    playSuccess({ soundOn, hapticsOn })
    headingRef.current?.focus()
  }, [tx, soundOn, hapticsOn])

  if (!tx) return <Navigate to="/home" replace />
  const count = tx.voucherIds.length

  return (
    <AppShell title={t('pay.title')} hideNav plain>
      <div className="flex flex-col items-center text-center">
        <span aria-hidden className="settle mt-2 flex size-28 items-center justify-center rounded-full bg-success text-white">
          <Check className="size-16" strokeWidth={3.5} />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-5 text-title font-bold text-success outline-none">
          {t('result.success.title')}
        </h2>
        <p className="mt-1 text-amount-xl font-bold text-brand-900">{formatCurrency(tx.amount, lang)}</p>
      </div>

      <dl className="mt-6 divide-y divide-line rounded-card border border-line text-base">
        <div className="px-4 py-3">
          <dt className="text-sm text-ink-muted">{t('result.row.shop')}</dt>
          <dd className="font-bold">{state.merchant.name}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm text-ink-muted">{t('result.row.time')}</dt>
          <dd className="font-bold">{formatTime(tx.createdAt, lang)}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-sm text-ink-muted">{t('result.row.bank')}</dt>
          <dd className="font-bold">{t('home.paidTonight')}</dd>
        </div>
      </dl>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="tx-details"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex min-h-tap w-full items-center justify-between rounded-control px-2 text-base font-bold text-brand-700"
      >
        {t('result.details')}
        <ChevronDown aria-hidden className={open ? 'size-6 rotate-180 transition-transform' : 'size-6 transition-transform'} />
      </button>
      {open && (
        <dl id="tx-details" className="rounded-control bg-canvas px-3 py-2 text-base">
          <dt className="text-sm text-ink-muted">{t('result.detail.number')}</dt>
          <dd className="font-bold break-all">{tx.id}</dd>
          <dt className="mt-2 text-sm text-ink-muted">{t('result.detail.date')}</dt>
          <dd className="font-bold">{formatDate(tx.createdAt, lang)}</dd>
          <dt className="mt-2 text-sm text-ink-muted">{t('pay.sheet.voucherCodes')}</dt>
          <dd className="font-bold break-all">
            {t('pay.sheet.vouchersPlain', { count })}: {tx.voucherIds.join(', ')}
          </dd>
          <dt className="mt-2 text-sm text-ink-muted">{t('pay.sheet.scheme')}</dt>
          <dd className="font-bold">{t('pay.scheme')}</dd>
          <dt className="mt-2 text-sm text-ink-muted">{t('result.detail.ids')}</dt>
          <dd className="font-bold">
            {state.merchant.id} / {state.merchant.deviceId}
          </dd>
        </dl>
      )}

      <div className="mt-6 flex flex-col gap-4 pb-2">
        <Link to="/pay" className="flex min-h-tap-pay items-center justify-center rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600">
          {t('result.next')}
        </Link>
        <Link
          to="/home"
          className="flex min-h-tap-pay items-center justify-center rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
        >
          {t('result.backHome')}
        </Link>
      </div>
    </AppShell>
  )
}
