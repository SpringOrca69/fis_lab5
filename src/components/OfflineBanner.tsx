import { WifiOff } from 'lucide-react'
import { useI18n } from '@/i18n/context'
import { useIsOnline } from '@/lib/offline'

/** Shown when the browser is offline or the /demo toggle forces it. Icon + words. */
export function OfflineBanner() {
  const { t } = useI18n()
  const online = useIsOnline()
  if (online) return null
  return (
    <div
      role="status"
      data-testid="offline-banner"
      className="print:hidden flex items-start gap-3 bg-warning-tint px-5 py-3 text-base font-bold text-warning"
    >
      <WifiOff aria-hidden className="mt-0.5 size-6 shrink-0" />
      <span>{t('offline.banner')}</span>
    </div>
  )
}
