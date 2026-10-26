import type { Lang } from '@/lib/format'
import { en, type Dictionary, type TranslationKey } from './en'
import { ms } from './ms'
import { ta } from './ta'
import { zh } from './zh'
import type { Params } from './context'

export const dictionaries: Record<Lang, Dictionary> = { en, zh, ms, ta }

export function translate(lang: Lang, key: TranslationKey, params?: Params): string {
  const raw = dictionaries[lang][key] ?? en[key]
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m))
}
