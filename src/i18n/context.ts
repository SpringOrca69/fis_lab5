import { createContext, useContext } from 'react'
import type { Lang } from '@/lib/format'
import type { TranslationKey } from './en'

export type Params = Record<string, string | number>

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, params?: Params) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const v = useContext(I18nContext)
  if (!v) throw new Error('useI18n must be used inside I18nProvider')
  return v
}
