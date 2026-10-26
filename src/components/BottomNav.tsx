import { ClipboardList, House, QrCode, Store, Wallet, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { useI18n } from '@/i18n/context'
import type { TranslationKey } from '@/i18n/en'
import { cn } from '@/lib/utils'

const ITEMS: { to: string; key: TranslationKey; Icon: LucideIcon; primary?: boolean }[] = [
  { to: '/home', key: 'nav.home', Icon: House },
  { to: '/pay', key: 'nav.pay', Icon: QrCode, primary: true },
  { to: '/history', key: 'nav.history', Icon: ClipboardList },
  { to: '/payouts', key: 'nav.payout', Icon: Wallet },
  { to: '/stall', key: 'nav.stall', Icon: Store },
]

/**
 * Five fixed tabs, same order on every screen. Pay is the one filled
 * tile because it is the job the app exists for. The active tab is
 * shown by a bar + bold label + filled icon tile, never colour alone.
 */
export function BottomNav() {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t('nav.label')}
      className="sticky bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgb(11_59_55/0.06)]"
    >
      <ul className="mx-auto flex max-w-[30rem] items-stretch justify-between px-1">
        {ITEMS.map(({ to, key, Icon, primary }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-tap-pay flex-col items-center justify-center gap-0.5 px-1 pt-2 pb-1.5 text-sm leading-tight text-ink-muted',
                  isActive && 'font-bold text-brand-700',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span aria-hidden className="absolute top-0 h-1 w-10 rounded-b-full bg-brand-700" />}
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-8 w-12 items-center justify-center rounded-full transition-colors',
                      primary && 'bg-brand-700 text-white',
                      !primary && isActive && 'bg-brand-100',
                    )}
                  >
                    <Icon className="size-6" strokeWidth={isActive ? 2.5 : 2} />
                  </span>
                  <span className="max-w-full truncate">{t(key)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
