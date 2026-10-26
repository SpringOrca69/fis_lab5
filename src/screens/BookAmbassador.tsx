import { CircleCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { BackButton } from '@/components/BackButton'
import { useStore } from '@/data/storeContext'
import type { AmbassadorBooking } from '@/data/types'
import { useI18n } from '@/i18n/context'
import { bookableDays, DEMO_NAME, DEMO_PHONE, SLOTS, validatePhone, type Slot } from '@/lib/booking'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const field = 'mt-1 min-h-tap-pay w-full rounded-control border-2 border-line bg-surface px-3 text-base'

/** Book an ambassador visit: one form, then a summary. In-app notification only. */
export default function BookAmbassador() {
  const { t, lang } = useI18n()
  const { state, dispatch } = useStore()
  const [days] = useState(() => bookableDays(new Date()))
  const [name, setName] = useState(DEMO_NAME)
  const [phone, setPhone] = useState(DEMO_PHONE)
  const [date, setDate] = useState(days[0])
  const [slot, setSlot] = useState<Slot>('am')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({})
  const [done, setDone] = useState<AmbassadorBooking | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs = { name: name.trim() === '', phone: !validatePhone(phone) }
    setErrors(errs)
    if (errs.name || errs.phone) return
    const now = new Date()
    const booking: AmbassadorBooking = {
      id: `B-${now.getTime()}`,
      date,
      slot,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
      status: 'booked',
    }
    dispatch({
      type: 'addBooking',
      booking,
      notification: {
        id: `N-${booking.id}`,
        type: 'booking',
        createdAt: now.toISOString(),
        read: false,
        i18nKey: 'notif.booking',
        params: { date, slot },
      },
    })
    setDone(booking)
  }

  if (done) {
    const rows: [string, string][] = [
      [t('book.done.date'), formatDate(done.date, lang)],
      [t('book.done.slot'), t(`book.slot.${done.slot as Slot}`)],
      [t('book.done.name'), done.name],
      [t('book.done.phone'), done.phone],
      [t('book.done.station'), t('book.stationName')],
    ]
    return (
      <AppShell title={t('book.title')}>
        <div className="flex flex-col gap-5" data-testid="booking-done">
          <div className="flex flex-col items-center text-center" role="status">
            <CircleCheck aria-hidden className="size-16 text-success" />
            <h2 className="mt-2 text-title font-bold">{t('book.done.title')}</h2>
            <p className="mt-1 text-base">{t('book.done.body', { shop: state.merchant.name })}</p>
          </div>
          <dl className="rounded-card bg-surface p-4 shadow-card">
            {rows.map(([k, v]) => (
              <div key={k} className="border-b border-line py-2 last:border-0">
                <dt className="text-sm text-ink-muted">{k}</dt>
                <dd className="text-base font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-base text-ink-muted">{t('book.done.reminder')}</p>
          <Link to="/home" className="flex min-h-tap-pay items-center justify-center rounded-control bg-brand-700 px-4 text-lg font-bold text-white">
            {t('book.done.home')}
          </Link>
          <Link
            to="/help"
            className="flex min-h-tap-pay items-center justify-center rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
          >
            {t('book.done.help')}
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title={t('book.title')}>
      <BackButton fallback="/help" />
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <p className="text-base">{t('book.intro')}</p>
        <p className="rounded-control bg-brand-50 p-3 text-base font-bold text-brand-900">{t('book.station')}</p>

        <label className="block text-base font-bold">
          {t('book.name')}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-invalid={errors.name || undefined}
            aria-describedby={errors.name ? 'err-name' : undefined}
            className={field}
          />
          {errors.name && (
            <span id="err-name" role="alert" className="mt-1 block text-base font-bold text-danger">
              {t('book.errName')}
            </span>
          )}
        </label>

        <label className="block text-base font-bold">
          {t('book.phone')}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={errors.phone || undefined}
            aria-describedby={errors.phone ? 'err-phone' : undefined}
            className={field}
          />
          {errors.phone && (
            <span id="err-phone" role="alert" className="mt-1 block text-base font-bold text-danger">
              {t('book.errPhone')}
            </span>
          )}
        </label>

        <fieldset>
          <legend className="text-base font-bold">{t('book.date')}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {days.map((d) => (
              <label key={d} className="relative">
                <input type="radio" name="date" value={d} checked={date === d} onChange={() => setDate(d)} className="peer sr-only" />
                <span
                  className={cn(
                    'flex min-h-tap items-center justify-center gap-1 rounded-control border-2 px-2 text-base font-bold peer-focus-visible:outline-3 peer-focus-visible:outline-focus',
                    date === d ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-surface',
                  )}
                >
                  {date === d && '✓ '}
                  {formatDate(d, lang)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-base font-bold">{t('book.slot')}</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SLOTS.map((s) => (
              <label key={s}>
                <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => setSlot(s)} className="peer sr-only" />
                <span
                  className={cn(
                    'flex min-h-tap items-center justify-center rounded-control border-2 px-1 text-base font-bold peer-focus-visible:outline-3 peer-focus-visible:outline-focus',
                    slot === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-surface',
                  )}
                >
                  {slot === s && '✓ '}
                  {t(`book.slot.${s}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-base font-bold">
          {t('book.note')}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className={cn(field, 'py-2')} />
        </label>

        <button type="submit" className="min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white">
          {t('book.submit')}
        </button>
      </form>
    </AppShell>
  )
}
