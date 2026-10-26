import type { Lang } from '@/lib/format'
import { localeFor } from '@/lib/format'
import { en, type Dictionary, type PluralKey, type TranslationKey } from './en'
import { ms } from './ms'
import { ta } from './ta'
import { zh } from './zh'
import type { Params } from './context'

export const dictionaries: Record<Lang, Dictionary> = { en, zh, ms, ta }

const rulesCache = new Map<Lang, Intl.PluralRules>()
function pluralCategory(lang: Lang, count: number): Intl.LDMLPluralRule {
  let rules = rulesCache.get(lang)
  if (!rules) {
    rules = new Intl.PluralRules(localeFor(lang))
    rulesCache.set(lang, rules)
  }
  return rules.select(count)
}

/**
 * Looks up a string and fills {params}. For a plural base key (e.g.
 * 'home.payments') a numeric `count` param picks the form via
 * Intl.PluralRules for the language, falling back to '.other'.
 */
export function translate(lang: Lang, key: TranslationKey | PluralKey, params?: Params): string {
  const dict = dictionaries[lang]
  const get = (k: string): string | undefined => (dict as Record<string, string>)[k] ?? (en as Record<string, string>)[k]
  let raw = get(key)
  if (raw === undefined) {
    const count = Number(params?.count ?? 0)
    raw = get(`${key}.${pluralCategory(lang, count)}`) ?? get(`${key}.other`) ?? key
  }
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in params ? String(params[name]) : m))
}
