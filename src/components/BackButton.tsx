import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { useI18n } from '@/i18n/context'

/** Goes to the previous screen; falls back to `fallback` when opened directly. */
export function BackButton({ fallback = '/home' }: { fallback?: string }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <button
      type="button"
      onClick={() => (location.key !== 'default' ? navigate(-1) : navigate(fallback))}
      className="-ml-2 mb-3 inline-flex min-h-tap items-center gap-2 rounded-control px-2 text-base font-bold text-brand-700"
    >
      <ArrowLeft aria-hidden className="size-6" />
      {t('common.back')}
    </button>
  )
}
