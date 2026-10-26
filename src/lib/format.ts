import { parseDateKey } from './dates'

export type Lang = 'en' | 'zh' | 'ms' | 'ta'
export const LANGS: readonly Lang[] = ['en', 'zh', 'ms', 'ta']

const LOCALES: Record<Lang, string> = { en: 'en-SG', zh: 'zh-SG', ms: 'ms-SG', ta: 'ta-SG' }

export function localeFor(lang: Lang): string {
  return LOCALES[lang]
}

export function formatCurrency(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(localeFor(lang), {
    style: 'currency',
    currency: 'SGD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatTime(iso: string | Date, lang: Lang): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return new Intl.DateTimeFormat(localeFor(lang), { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
}

/** Accepts an ISO timestamp, a Date, or a YYYY-MM-DD key. */
export function formatDate(value: string | Date, lang: Lang): string {
  const d = typeof value === 'string' ? (/^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDateKey(value) : new Date(value)) : value
  return new Intl.DateTimeFormat(localeFor(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}
