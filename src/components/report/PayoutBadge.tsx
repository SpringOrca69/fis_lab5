import { CheckCircle2, Clock, TriangleAlert } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import type { PayoutStatus } from '@/data/types'
import { cn } from '@/lib/utils'

const LOOK = {
  scheduled: { Icon: Clock, cls: 'bg-warning-tint text-warning', key: 'payouts.badge.scheduled' },
  paid: { Icon: CheckCircle2, cls: 'bg-success-tint text-success', key: 'payouts.badge.paid' },
  matched: { Icon: CheckCircle2, cls: 'bg-success-tint text-success', key: 'payouts.badge.matched' },
  not_matched: { Icon: TriangleAlert, cls: 'bg-danger-tint text-danger', key: 'payouts.badge.notMatched' },
} as const

/** Icon plus words, never colour alone. */
export function PayoutBadge({ status }: { status: PayoutStatus }) {
  const { t } = useI18n()
  const { Icon, cls, key } = LOOK[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold', cls)}>
      <Icon aria-hidden className="size-5 shrink-0" />
      {t(key)}
    </span>
  )
}
