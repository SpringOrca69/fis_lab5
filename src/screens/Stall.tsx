import { ChevronRight, LogOut, Wrench } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { useAuth } from '@/auth/authContext'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { LANGS, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const card = 'rounded-card bg-surface p-5 shadow-card'

function Switch({ label, hint, on, onChange, testId }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void; testId: string }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3 border-t border-line py-3 first:border-0 first:pt-0">
      <div className="min-w-0 flex-1">
        <p id={`${testId}-l`} className="text-base font-bold">
          {label}
        </p>
        <p className="text-sm text-ink-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`${testId}-l`}
        data-testid={testId}
        onClick={() => onChange(!on)}
        className={cn(
          'min-h-tap-pay min-w-24 shrink-0 rounded-control border-2 px-3 text-base font-bold',
          on ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-surface text-ink',
        )}
      >
        {on ? `✓ ${t('stall.on')}` : t('stall.off')}
      </button>
    </div>
  )
}

/** Shop details, language, sound and vibration, scheme info, demo tools, log out. */
export default function Stall() {
  const { t, lang, setLang } = useI18n()
  const { state, dispatch } = useStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const m = state.merchant
  const rows: [string, string][] = [
    [t('stall.merchantId'), m.id],
    [t('stall.deviceId'), m.deviceId],
    [t('stall.bank'), t('stall.bankValue', { last4: m.bankLast4 })],
  ]

  return (
    <AppShell title={t('stall.title')}>
      <div className="flex flex-col gap-5">
        <section aria-labelledby="shop-h" className={card}>
          <h2 id="shop-h" className="text-title font-bold">
            {m.name}
          </h2>
          <p className="text-base text-ink-muted">{m.address}</p>
          <dl className="mt-3">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-t border-line py-2">
                <dt className="text-base text-ink-muted">{k}</dt>
                <dd className="text-base font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="lang-h" className={card}>
          <h2 id="lang-h" className="mb-3 text-lg font-bold">
            {t('lang.label')}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  'min-h-tap-pay rounded-control border-2 px-2 text-base font-bold',
                  lang === l ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-surface',
                )}
              >
                {lang === l ? '✓ ' : ''}
                {t(`lang.${l}`)}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="set-h" className={card}>
          <h2 id="set-h" className="mb-3 text-lg font-bold">
            {t('stall.settings')}
          </h2>
          <Switch
            testId="sound-switch"
            label={t('stall.sound')}
            hint={t('stall.soundHint')}
            on={state.settings.soundOn}
            onChange={(v) => dispatch({ type: 'setSettings', settings: { soundOn: v } })}
          />
          <Switch
            testId="vibration-switch"
            label={t('stall.vibration')}
            hint={t('stall.vibrationHint')}
            on={state.settings.hapticsOn}
            onChange={(v) => dispatch({ type: 'setSettings', settings: { hapticsOn: v } })}
          />
        </section>

        <section aria-labelledby="scheme-h" className={card}>
          <h2 id="scheme-h" className="text-lg font-bold">
            {t('stall.scheme')}
          </h2>
          <p className="text-base font-bold text-brand-700">{t('stall.schemeName')}</p>
          <p className="text-base">{t('stall.schemeValid', { date: formatDate('2026-12-31', lang) })}</p>
        </section>

        <Link to="/demo" className="flex min-h-tap-pay items-center gap-3 rounded-control border-2 border-line bg-surface px-4 py-2">
          <Wrench aria-hidden className="size-6 shrink-0 text-brand-700" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-bold">{t('stall.demo')}</span>
            <span className="block text-sm text-ink-muted">{t('stall.demoHint')}</span>
          </span>
          <ChevronRight aria-hidden className="size-6 shrink-0 text-ink-muted" />
        </Link>

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/', { replace: true })
          }}
          className="flex min-h-tap-pay items-center justify-center gap-2 rounded-control border-2 border-danger bg-surface px-4 text-base font-bold text-danger"
        >
          <LogOut aria-hidden className="size-6" />
          {t('stall.logout')}
        </button>
      </div>
    </AppShell>
  )
}
