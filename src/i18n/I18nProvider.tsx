import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LANGS, type Lang } from '@/lib/format'
import { I18nContext } from './context'
import type { PluralKey, TranslationKey } from './en'
import { translate } from './translate'

export const LANG_KEY = 'heartpay:lang'

function loadLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY)
    if (v && (LANGS as readonly string[]).includes(v)) return v as Lang
  } catch {
    /* ignore */
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ lang, setLang, t: (key: TranslationKey | PluralKey, params?: Record<string, string | number>) => translate(lang, key, params) }),
    [lang, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
