import { CircleAlert, ImageUp } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { useI18n } from '@/i18n/context'

/** Pick a screenshot of the QR code. `decode` returns the text or null. */
export function ImageUpload({
  failed,
  decode,
  onText,
  onFail,
  onUseCamera,
}: {
  failed: boolean
  decode: (file: File) => Promise<string | null>
  onText: (text: string) => void
  onFail: () => void
  onUseCamera: () => void
}) {
  const { t } = useI18n()
  const input = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setReading(true)
    const text = await decode(file)
    setReading(false)
    if (text) onText(text)
    else onFail()
  }

  return (
    <section aria-labelledby="upload-h" className="flex flex-col gap-4">
      <h2 id="upload-h" className="text-title font-bold">
        {t('pay.upload.title')}
      </h2>
      <div className="rounded-card bg-surface p-5 shadow-card">
        <p className="text-base">{t('pay.upload.body')}</p>
        <p aria-live="polite" className="mt-3 text-base font-bold">
          {reading && t('pay.upload.reading')}
        </p>
        {failed && !reading && (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-control bg-danger-tint px-3 py-2 text-base font-bold text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-6 shrink-0" />
            {t('pay.upload.fail')}
          </p>
        )}
        <input ref={input} type="file" accept="image/*" onChange={(e) => void pick(e)} className="sr-only" tabIndex={-1} aria-hidden data-testid="upload-input" />
      </div>
      <button
        type="button"
        disabled={reading}
        onClick={() => input.current?.click()}
        className="flex min-h-tap-pay w-full items-center justify-center gap-2 rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        <ImageUp aria-hidden className="size-6" />
        {t('pay.upload.choose')}
      </button>
      <button
        type="button"
        onClick={onUseCamera}
        className="mt-2 min-h-tap w-full rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
      >
        {t('pay.useCamera')}
      </button>
    </section>
  )
}
