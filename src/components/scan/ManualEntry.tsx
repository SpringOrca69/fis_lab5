import { useState, type FormEvent } from 'react'
import { useI18n } from '@/i18n/context'

export function ManualEntry({ onSubmit, onUseCamera }: { onSubmit: (text: string) => void; onUseCamera: () => void }) {
  const { t } = useI18n()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) {
      setError(true)
      return
    }
    onSubmit(value)
  }
  return (
    <form onSubmit={submit} noValidate aria-labelledby="manual-h" className="flex flex-col gap-4">
      <h2 id="manual-h" className="text-title font-bold">
        {t('pay.manual.title')}
      </h2>
      <div className="rounded-card bg-surface p-5 shadow-card">
        <label htmlFor="voucher-code" className="text-base font-bold">
          {t('pay.manual.label')}
        </label>
        <p id="voucher-hint" className="text-sm text-ink-muted">
          {t('pay.manual.hint')}
        </p>
        <input
          id="voucher-code"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          aria-describedby={error ? 'voucher-hint voucher-err' : 'voucher-hint'}
          aria-invalid={error}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="mt-2 min-h-tap-pay w-full rounded-control border-2 border-line bg-surface px-3 text-base"
        />
        {error && (
          <p id="voucher-err" role="alert" className="mt-2 text-base font-bold text-danger">
            {t('pay.manual.empty')}
          </p>
        )}
      </div>
      <button type="submit" className="min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600">
        {t('pay.manual.submit')}
      </button>
      <button
        type="button"
        onClick={onUseCamera}
        className="mt-2 min-h-tap w-full rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
      >
        {t('pay.useCamera')}
      </button>
    </form>
  )
}
