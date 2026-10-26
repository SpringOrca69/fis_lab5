import { AppShell } from '@/components/AppShell'
import { useI18n } from '@/i18n/context'
import type { TranslationKey } from '@/i18n/en'

/** Holds a route open so nav links resolve. Replaced by the real screen in a later phase. */
export default function Placeholder({ titleKey }: { titleKey: TranslationKey }) {
  const { t } = useI18n()
  return (
    <AppShell title={t(titleKey)}>
      <p className="text-ink-muted">{t('common.laterPhase')}</p>
    </AppShell>
  )
}
