import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { buildDemoScenarios } from '@/lib/demoQr'
import { isSimulatedOffline, setSimulatedOffline, useIsOnline } from '@/lib/offline'

/** Test QR codes for every scenario. Open on a laptop, scan with the phone. Public route. */
export default function Demo() {
  const { t } = useI18n()
  const { resetDemo } = useStore()
  const [scenarios, setScenarios] = useState(() => buildDemoScenarios())
  const [resetDone, setResetDone] = useState(false)
  useIsOnline() // re-render when the toggle changes
  const offline = isSimulatedOffline()

  return (
    <AppShell title={t('demo.title')} hideNav>
      <div className="flex flex-col gap-5">
        <p className="text-base">{t('demo.intro')}</p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setScenarios(buildDemoScenarios())}
            className="min-h-tap w-full rounded-control bg-brand-700 px-4 text-base font-bold text-white hover:bg-brand-600"
          >
            {t('demo.refresh')}
          </button>
          <button
            type="button"
            onClick={() => {
              resetDemo()
              setResetDone(true)
            }}
            className="min-h-tap w-full rounded-control border-2 border-brand-700 bg-surface px-4 text-base font-bold text-brand-700"
          >
            {t('demo.reset')}
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={offline}
            onClick={() => setSimulatedOffline(!offline)}
            className="flex min-h-tap w-full items-center justify-between gap-3 rounded-control border-2 border-brand-700 bg-surface px-4 text-left text-base font-bold text-brand-700"
          >
            <span>{t('demo.offline')}</span>
            <span className={offline ? 'rounded-full bg-warning-tint px-3 py-1 text-warning' : 'rounded-full bg-brand-50 px-3 py-1'}>
              {offline ? t('demo.offline.on') : t('demo.offline.off')}
            </span>
          </button>
          <p aria-live="polite" className="text-base font-bold text-success">
            {resetDone && t('demo.resetDone')}
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {scenarios.map((s) => (
            <li key={s.id} data-testid={`demo-${s.id}`} className="rounded-card bg-surface p-4 shadow-card">
              <h2 className="text-lg font-bold">{t(s.labelKey)}</h2>
              <p className="text-base text-ink-muted">{t(s.explainKey)}</p>
              <div className="mt-3 flex justify-center rounded-control bg-white p-3">
                <QRCodeSVG value={s.payload} size={208} level="M" title={t(s.labelKey)} />
              </div>
              <p className="mt-3 text-sm text-ink-muted">{t('demo.codeLabel')}</p>
              <p className="text-sm font-bold break-all select-all">{s.payload}</p>
            </li>
          ))}
        </ul>

        <Link to="/" className="flex min-h-tap-pay items-center justify-center rounded-control border-2 border-brand-700 px-4 text-base font-bold text-brand-700">
          {t('demo.open')}
        </Link>
      </div>
    </AppShell>
  )
}
