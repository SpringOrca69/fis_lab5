import { csvFileName } from './report'

export function downloadCsv(csv: string, dateKeyStr: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = csvFileName(dateKeyStr)
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

/** Shares the CSV file where the browser allows it (e.g. WhatsApp), else a text summary. Returns false if cancelled. */
export async function shareReport(opts: { csv: string; dateKeyStr: string; title: string; text: string }): Promise<boolean> {
  const file = new File([opts.csv], csvFileName(opts.dateKeyStr), { type: 'text/csv' })
  try {
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: opts.title, text: opts.text, files: [file] })
    } else {
      await navigator.share({ title: opts.title, text: opts.text })
    }
    return true
  } catch {
    return false // user cancelled, or the browser refused
  }
}
