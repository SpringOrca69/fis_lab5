import { ImageUp, Keyboard, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { useI18n } from '@/i18n/context'

/** Ways to take the payment without a working camera. The merchant is never stuck. */
export function Fallbacks({ onManual, onUpload }: { onManual: () => void; onUpload: () => void }) {
  const { t } = useI18n()
  const row = 'flex min-h-tap-pay w-full items-center gap-3 rounded-control border-2 border-line bg-surface px-4 text-left text-base font-bold'
  return (
    <section aria-labelledby="fb-h" className="mt-2 flex flex-col gap-3">
      <h2 id="fb-h" className="text-lg font-bold">
        {t('pay.fallback.title')}
      </h2>
      <button type="button" onClick={onManual} className={row}>
        <Keyboard aria-hidden className="size-6 text-brand-700" />
        {t('pay.fallback.manual')}
      </button>
      <button type="button" onClick={onUpload} className={row}>
        <ImageUp aria-hidden className="size-6 text-brand-700" />
        {t('pay.fallback.upload')}
      </button>
      <Link to="/help" className={row}>
        <Phone aria-hidden className="size-6 text-brand-700" />
        {t('pay.callHelper')}
      </Link>
    </section>
  )
}
