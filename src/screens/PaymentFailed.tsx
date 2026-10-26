import { CircleX, Phone } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { playFailure } from '@/lib/feedback'
import type { FailureReason } from '@/lib/redeem'

const REASONS: readonly FailureReason[] = ['expired', 'already_used', 'wrong_voucher_type', 'insufficient', 'network']

/**
 * Screen 4b: white page, red icon. After the headline, "No money was taken"
 * is the biggest text, then the plain reason.
 */
export default function PaymentFailed() {
  const { t } = useI18n()
  const { state } = useStore()
  const [params] = useSearchParams()
  const raw = params.get('reason')
  const reason = REASONS.find((r) => r === raw)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const played = useRef(false)
  const { soundOn, hapticsOn } = state.settings

  useEffect(() => {
    if (played.current) return
    played.current = true
    playFailure({ soundOn, hapticsOn })
    headingRef.current?.focus()
  }, [soundOn, hapticsOn])

  return (
    <AppShell title={t('pay.title')} hideNav plain>
      <div className="flex flex-col items-center text-center" role="alert">
        <span aria-hidden className="settle mt-2 flex size-28 items-center justify-center rounded-full bg-danger-tint text-danger">
          <CircleX className="size-20" strokeWidth={2.5} />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-5 max-w-full text-title font-bold text-danger outline-none break-words text-balance">
          {t('result.fail.title')}
        </h2>
        <p className="text-amount-wide mt-3 max-w-full text-amount font-bold text-ink text-balance">{t('result.fail.noMoney')}</p>
        <p className="mt-3 max-w-full text-lg break-words">{t(reason ? `result.reason.${reason}` : 'result.reason.generic')}</p>
        {reason === 'wrong_voucher_type' && (
          <p className="mt-1 max-w-full text-lg font-bold break-words">
            {t('result.reason.wrong_voucher_type.ask', { type: t(`voucher.type.${state.merchant.acceptedVoucherType}`) })}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 pb-2">
        <Link to="/pay" className="flex min-h-tap-pay items-center justify-center rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600">
          {t('common.tryAgain')}
        </Link>
        <Link
          to="/help"
          className="flex min-h-tap-pay items-center justify-center gap-2 rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
        >
          <Phone aria-hidden className="size-6" />
          {t('pay.callHelper')}
        </Link>
      </div>
    </AppShell>
  )
}
