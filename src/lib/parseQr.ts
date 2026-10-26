/**
 * Validates scanned or typed text. Made-up demo format:
 * `CDC1|<voucherId>,<voucherId>,...|<totalAmount>|<expiryYYYYMMDD>|<nonce>`
 * Nothing here charges anyone; it only says what the text is.
 */
export type QrResult =
  | { kind: 'cdc'; vouchers: string[]; amount: number; expiry: string; nonce: string }
  | { kind: 'url'; domain: string }
  | { kind: 'not_cdc' }

/** Domains for which "Open link" may be offered. Empty in the POC, so never shown. */
export const URL_ALLOWLIST: readonly string[] = []

const ID = /^[A-Za-z0-9-]{1,40}$/
const NONCE = /^[A-Za-z0-9]{1,24}$/

function validDate(yyyymmdd: string): string | null {
  if (!/^\d{8}$/.test(yyyymmdd)) return null
  const y = Number(yyyymmdd.slice(0, 4))
  const m = Number(yyyymmdd.slice(4, 6))
  const d = Number(yyyymmdd.slice(6, 8))
  const dt = new Date(y, m - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`
}

export function parseQr(text: string | null | undefined): QrResult {
  const raw = (text ?? '').trim()
  if (!raw) return { kind: 'not_cdc' }

  if (raw.startsWith('CDC1|')) {
    const parts = raw.split('|')
    if (parts.length !== 5) return { kind: 'not_cdc' }
    const [, idList, amountText, expiryText, nonce] = parts
    const vouchers = idList.split(',')
    if (vouchers.length === 0 || !vouchers.every((v) => ID.test(v))) return { kind: 'not_cdc' }
    if (!/^\d{1,4}(\.\d{1,2})?$/.test(amountText)) return { kind: 'not_cdc' }
    const amount = Number(amountText)
    if (!(amount > 0)) return { kind: 'not_cdc' }
    const expiry = validDate(expiryText)
    if (!expiry || !NONCE.test(nonce)) return { kind: 'not_cdc' }
    return { kind: 'cdc', vouchers, amount, expiry, nonce }
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const domain = new URL(raw).hostname
      if (domain) return { kind: 'url', domain }
    } catch {
      /* fall through */
    }
  }
  return { kind: 'not_cdc' }
}

export function isAllowlisted(domain: string): boolean {
  return URL_ALLOWLIST.includes(domain.toLowerCase())
}
