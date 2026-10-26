import { CircleAlert, ScanLine, ShieldAlert } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { BottomPanel } from './BottomPanel'

type Variant = { kind: 'unreadable' } | { kind: 'not_cdc' } | { kind: 'url'; domain: string }

/** Unreadable, not a CDC code, or a website link. The only action is Scan again (plus typing a code). */
export function MessagePanel({ variant, onScanAgain, onManual }: { variant: Variant; onScanAgain: () => void; onManual?: () => void }) {
  const { t } = useI18n()
  const Icon = variant.kind === 'url' ? ShieldAlert : variant.kind === 'unreadable' ? ScanLine : CircleAlert
  const title = variant.kind === 'url' ? t('pay.url.title') : variant.kind === 'unreadable' ? t('pay.unreadable.title') : t('pay.notCdc.title')
  const body = variant.kind === 'url' ? t('pay.url.warn') : variant.kind === 'unreadable' ? t('pay.unreadable.body') : t('pay.notCdc.body')
  return (
    <BottomPanel labelledBy="msg-title">
      <div className="flex items-start gap-3">
        <Icon aria-hidden className="mt-1 size-8 shrink-0 text-warning" />
        <h2 id="msg-title" className="text-lg font-bold">
          {title}
        </h2>
      </div>
      {variant.kind === 'url' && (
        <div className="mt-3 rounded-control bg-warning-tint px-3 py-3">
          <p className="text-sm text-ink-muted">{t('pay.url.domain')}</p>
          <p className="text-lg font-bold break-all text-ink">{variant.domain}</p>
        </div>
      )}
      <p className="mt-3 text-base">{body}</p>
      <button
        type="button"
        onClick={onScanAgain}
        className="mt-5 min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600"
      >
        {t('pay.scanAgain')}
      </button>
      {onManual && (
        <button
          type="button"
          onClick={onManual}
          className="mt-4 min-h-tap w-full rounded-control border-2 border-brand-700 px-4 text-base font-bold text-brand-700"
        >
          {t('pay.typeCode')}
        </button>
      )}
    </BottomPanel>
  )
}
