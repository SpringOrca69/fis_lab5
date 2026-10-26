import { CameraOff } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/i18n/context'
import type { TranslationKey } from '@/i18n/en'
import { detectBrowser, type BrowserKind } from '@/lib/camera'
import { cn } from '@/lib/utils'

const TABS: { id: BrowserKind; label: TranslationKey }[] = [
  { id: 'chrome', label: 'pay.browser.chrome' },
  { id: 'safari', label: 'pay.browser.safari' },
  { id: 'samsung', label: 'pay.browser.samsung' },
]

const STEPS: Record<BrowserKind, TranslationKey[]> = {
  chrome: ['pay.blocked.chrome.1', 'pay.blocked.chrome.2', 'pay.blocked.chrome.3', 'pay.blocked.chrome.4'],
  safari: ['pay.blocked.safari.1', 'pay.blocked.safari.2', 'pay.blocked.safari.3', 'pay.blocked.safari.4'],
  samsung: ['pay.blocked.samsung.1', 'pay.blocked.samsung.2', 'pay.blocked.samsung.3', 'pay.blocked.samsung.4'],
}

/** Numbered steps per browser. "Try again" re-checks; it never re-prompts in a loop. */
export function CameraBlocked({ stillBlocked, busy, onTryAgain }: { stillBlocked: boolean; busy: boolean; onTryAgain: () => void }) {
  const { t } = useI18n()
  const [tab, setTab] = useState<BrowserKind>(() => detectBrowser())
  return (
    <section aria-labelledby="blocked-h" className="flex flex-col gap-4">
      <div className="rounded-card bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <CameraOff aria-hidden className="size-9 shrink-0 text-danger" />
          <h2 id="blocked-h" className="text-title font-bold">
            {t('pay.blocked.title')}
          </h2>
        </div>
        <p className="mt-3 text-base">{t('pay.blocked.intro')}</p>
        {stillBlocked && (
          <p role="alert" className="mt-3 rounded-control bg-danger-tint px-3 py-2 text-base font-bold text-danger">
            {t('pay.blocked.stillBlocked')}
          </p>
        )}
        <p className="mt-4 text-sm text-ink-muted">{t('pay.blocked.stepsFor')}</p>
        <div role="tablist" aria-label={t('pay.blocked.stepsFor')} className="mt-1 grid grid-cols-3 gap-1 rounded-control bg-canvas p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={tab === id}
              aria-controls="blocked-steps"
              onClick={() => setTab(id)}
              className={cn(
                'min-h-tap rounded-[0.5rem] px-1 text-sm leading-tight font-bold',
                tab === id ? 'bg-brand-700 text-white' : 'text-ink',
              )}
            >
              {t(label)}
            </button>
          ))}
        </div>
        <ol id="blocked-steps" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-3 flex flex-col gap-2">
          {STEPS[tab].map((k, i) => (
            <li key={k} className="flex gap-3 text-base">
              <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-900">
                {i + 1}
              </span>
              <span>{t(k)}</span>
            </li>
          ))}
        </ol>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onTryAgain}
        className="min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {t('common.tryAgain')}
      </button>
    </section>
  )
}
