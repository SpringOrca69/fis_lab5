import { Check, CircleAlert, HeartHandshake, LifeBuoy, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/auth/authContext'
import { useI18n } from '@/i18n/context'
import { HELPLINE } from '@/lib/constants'
import { LANGS } from '@/lib/format'
import { cn } from '@/lib/utils'

export const SINGPASS_DELAY_MS = 1200

type Phase = 'idle' | 'loading' | 'failed'

/**
 * Screen 1. Language comes first so every later word is in the merchant's
 * own language. One primary action: log in. Failure is shown inline with
 * icon + words, and points to Help.
 */
export default function Login() {
  const { t, lang, setLang } = useI18n()
  const { loggedIn, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [phase, setPhase] = useState<Phase>('idle')
  // `?singpass=fail` forces the first attempt to fail, for demos and tests.
  const failNext = useRef(params.get('singpass') === 'fail')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (loggedIn && phase !== 'loading') return <Navigate to="/home" replace />

  function start() {
    setPhase('loading')
    timer.current = window.setTimeout(() => {
      if (failNext.current || !navigator.onLine) {
        failNext.current = false
        setPhase('failed')
        return
      }
      login()
      navigate('/home', { replace: true })
    }, SINGPASS_DELAY_MS)
  }

  const loading = phase === 'loading'

  return (
    <div className="mx-auto flex min-h-dvh max-w-[30rem] flex-col bg-canvas pt-[env(safe-area-inset-top)] shadow-card">
      <main className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-4">
        <header className="flex items-center gap-3">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-card bg-brand-700 text-white">
            <HeartHandshake className="size-7" />
          </span>
          <div>
            <h1 className="text-title font-bold text-brand-900">{t('app.name')}</h1>
            <p className="text-base text-ink-muted">{t('login.tagline')}</p>
          </div>
        </header>

        <section aria-labelledby="lang-h">
          <h2 id="lang-h" className="mb-2 text-lg font-bold">
            {t('login.chooseLanguage')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LANGS.map((l) => {
              const on = lang === l
              return (
                <button
                  key={l}
                  type="button"
                  lang={l}
                  aria-pressed={on}
                  disabled={loading}
                  onClick={() => setLang(l)}
                  className={cn(
                    'flex min-h-tile items-center justify-between gap-2 rounded-control border-2 px-4 text-left text-lg font-bold',
                    on ? 'border-brand-700 bg-brand-100 text-brand-900' : 'border-line bg-surface text-ink',
                  )}
                >
                  <span>{t(`lang.${l}`)}</span>
                  {on && <Check aria-hidden className="size-6 shrink-0 text-brand-700" />}
                </button>
              )
            })}
          </div>
        </section>

        {phase === 'failed' && (
          <div role="alert" className="flex gap-3 rounded-card border-2 border-danger bg-danger-tint p-4 text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-7 shrink-0" />
            <div>
              <p className="text-lg font-bold">{t('login.failTitle')}</p>
              <p className="mt-1 text-base text-ink">{t('login.failBody')}</p>
              <Link
                to="/help"
                className="mt-3 inline-flex min-h-tap items-center gap-2 rounded-control border-2 border-danger bg-surface px-4 font-bold text-danger"
              >
                <LifeBuoy aria-hidden className="size-5" />
                {t('common.getHelp')}
              </Link>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={start}
            disabled={loading}
            aria-busy={loading}
            className="flex min-h-tap-pay w-full items-center justify-center gap-3 rounded-control bg-brand-700 px-4 text-lg font-bold text-white disabled:opacity-90"
          >
            {loading && <Loader2 aria-hidden className="size-6 animate-spin" />}
            {loading ? t('login.loggingIn') : phase === 'failed' ? t('common.tryAgain') : t('login.singpass')}
          </button>
          {phase !== 'failed' && (
            <Link to="/help" className="flex min-h-tap items-center justify-center font-bold text-brand-700 underline underline-offset-4">
              {t('login.trouble')}
            </Link>
          )}
        </div>
      </main>

      <footer className="flex flex-col gap-1 border-t border-line px-5 pt-4 pb-6 text-center text-sm text-ink-muted">
        <p className="text-base font-bold text-ink">{t('login.needHelp', { phone: HELPLINE })}</p>
        <p>{t('login.hours')}</p>
        <p>{t('login.existingOnly')}</p>
        <p>{t('app.disclaimer')}</p>
      </footer>
    </div>
  )
}
