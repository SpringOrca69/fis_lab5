import { ChevronDown, TicketCheck } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/i18n/context'
import { formatCurrency, formatDate } from '@/lib/format'
import type { QrResult } from '@/lib/parseQr'
import { BottomPanel } from './BottomPanel'

type Cdc = Extract<QrResult, { kind: 'cdc' }>

interface Props {
  result: Cdc
  onConfirm: () => void
  onCancel: () => void
}

/** Valid code: the amount first, then one clear action. Nothing is charged until Confirm. */
export function ResultSheet({ result, onConfirm, onCancel }: Props) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const count = result.vouchers.length
  const each = result.amount / count
  const breakdown = Number.isInteger(each)
    ? t('pay.sheet.vouchers', { count, value: formatCurrency(each, lang).replace(/\.00$/, '') })
    : t('pay.sheet.vouchersPlain', { count })

  return (
    <BottomPanel labelledBy="sheet-title">
      <p id="sheet-title" className="flex items-center gap-2 text-base font-bold text-ink-muted">
        <TicketCheck aria-hidden className="size-6 text-brand-700" />
        {t('pay.sheet.title')}
      </p>
      <p className="mt-1 text-amount-xl font-bold text-brand-900">{formatCurrency(result.amount, lang)}</p>
      <p className="text-lg font-bold">{breakdown}</p>
      <p className="mt-1 text-base text-ink-muted">{t('pay.sheet.valid', { date: formatDate(result.expiry, lang) })}</p>
      <p className="mt-3 rounded-control bg-warning-tint px-3 py-2 text-base text-warning">{t('pay.sheet.check')}</p>

      <button
        type="button"
        onClick={onConfirm}
        className="mt-5 min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600"
      >
        {t('pay.sheet.confirm')}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="mt-6 min-h-tap-pay w-full rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
      >
        {t('pay.sheet.cancel')}
      </button>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="sheet-details"
        onClick={() => setOpen((o) => !o)}
        className="mt-4 flex min-h-tap w-full items-center justify-between rounded-control px-2 text-base font-bold text-brand-700"
      >
        {t('pay.sheet.details')}
        <ChevronDown aria-hidden className={open ? 'size-6 rotate-180 transition-transform' : 'size-6 transition-transform'} />
      </button>
      {open && (
        <dl id="sheet-details" className="rounded-control bg-canvas px-3 py-2 text-base">
          <dt className="text-sm text-ink-muted">{t('pay.sheet.voucherCodes')}</dt>
          <dd className="break-all font-bold">{result.vouchers.join(', ')}</dd>
          <dt className="mt-2 text-sm text-ink-muted">{t('pay.sheet.scheme')}</dt>
          <dd className="font-bold">{t('pay.scheme')}</dd>
        </dl>
      )}
    </BottomPanel>
  )
}
