import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n/context'
import { parseDateKey } from '@/lib/dates'
import { localeFor } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Props {
  /** Allowed days, newest first (today first). */
  keys: string[]
  value: string
  onChange: (key: string) => void
}

/**
 * Date picker limited to the allowed days. A plain grid of big day buttons
 * in a dialog: easier to hit than a month calendar, and it cannot show
 * days we have no data for.
 */
export function DayPicker({ keys, value, onChange }: Props) {
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const idx = keys.indexOf(value)
  const loc = localeFor(lang)
  const longDate = (k: string) =>
    new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short' }).format(parseDateKey(k))

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => {
    setOpen(false)
    openerRef.current?.focus()
  }
  const step = 'flex size-tap-pay shrink-0 items-center justify-center rounded-control border-2 border-line bg-surface disabled:opacity-40'

  return (
    <div className="flex items-stretch gap-2 print:hidden">
      <button
        type="button"
        className={step}
        aria-label={t('report.prevDay')}
        disabled={idx >= keys.length - 1}
        onClick={() => onChange(keys[idx + 1])}
      >
        <ChevronLeft aria-hidden className="size-6" />
      </button>
      <button
        ref={openerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex min-h-tap-pay min-w-0 flex-1 items-center justify-center gap-2 rounded-control border-2 border-brand-700 bg-surface px-3 text-base font-bold text-brand-900"
      >
        <CalendarDays aria-hidden className="size-6 shrink-0" />
        <span className="truncate">{longDate(value)}</span>
      </button>
      <button
        type="button"
        className={step}
        aria-label={t('report.nextDay')}
        disabled={idx <= 0}
        onClick={() => onChange(keys[idx - 1])}
      >
        <ChevronRight aria-hidden className="size-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('report.pickDay')}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[30rem] rounded-t-card bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{t('report.pickDay')}</h2>
                <p className="text-base text-ink-muted">{t('report.pickDayHint')}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="flex min-h-tap shrink-0 items-center gap-1 rounded-control px-3 text-base font-bold text-brand-700"
              >
                <X aria-hidden className="size-5" />
                {t('report.close')}
              </button>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2">
              {keys.map((k, i) => {
                const d = parseDateKey(k)
                const selected = k === value
                return (
                  <li key={k}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      aria-label={i === 0 ? `${t('report.todayTag')}, ${longDate(k)}` : longDate(k)}
                      onClick={() => {
                        onChange(k)
                        close()
                      }}
                      className={cn(
                        'flex min-h-tap w-full flex-col items-center justify-center rounded-control border-2 px-1 py-1 text-sm leading-tight',
                        selected ? 'border-brand-700 bg-brand-700 font-bold text-white' : 'border-line bg-surface',
                      )}
                    >
                      <span className="text-lg font-bold">{d.getDate()}</span>
                      <span>{i === 0 ? t('report.todayTag') : new Intl.DateTimeFormat(loc, { weekday: 'short', month: 'short' }).format(d)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
