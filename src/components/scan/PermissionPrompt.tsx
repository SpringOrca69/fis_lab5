import { Camera, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/i18n/context'

/** Shown before the browser prompt. "Allow camera" is the tap that starts the camera. */
export function PermissionPrompt({ busy, onAllow, onNotNow }: { busy: boolean; onAllow: () => void; onNotNow: () => void }) {
  const { t } = useI18n()
  return (
    <section aria-labelledby="explain-h" className="flex flex-col gap-4">
      <div className="rounded-card bg-surface p-5 shadow-card">
        <span aria-hidden className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Camera className="size-9" />
        </span>
        <h2 id="explain-h" className="mt-4 text-title font-bold">
          {t('pay.explain.title')}
        </h2>
        <p className="mt-3 text-base">{t('pay.explain.why')}</p>
        <p className="mt-3 flex items-start gap-2 rounded-control bg-brand-50 px-3 py-2 text-base font-bold text-brand-900">
          <ShieldCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-brand-700" />
          {t('pay.explain.not')}
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onAllow}
        className="min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {t('pay.explain.allow')}
      </button>
      <button
        type="button"
        onClick={onNotNow}
        className="mt-2 min-h-tap w-full rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
      >
        {t('pay.explain.notNow')}
      </button>
    </section>
  )
}
