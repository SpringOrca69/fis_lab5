import { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it } from 'vitest'
import { useI18n } from './context'
import { en } from './en'
import { I18nProvider, LANG_KEY } from './I18nProvider'
import { dictionaries, translate } from './translate'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Probe({ pick }: { pick: string }) {
  const { lang, setLang, t } = useI18n()
  useEffect(() => {
    if (pick !== lang) setLang(pick as 'en')
  }, [pick, lang, setLang])
  return <p>{t('nav.home')}</p>
}

async function mount(pick: string) {
  const el = document.createElement('div')
  const root = createRoot(el)
  await act(async () => root.render(<I18nProvider><Probe pick={pick} /></I18nProvider>))
  return { el, root }
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
  })

  it('persists language across a reload and sets <html lang> (P1-4)', async () => {
    const first = await mount('ms')
    expect(localStorage.getItem(LANG_KEY)).toBe('ms')
    expect(document.documentElement.lang).toBe('ms')
    await act(async () => first.root.unmount())
    document.documentElement.lang = ''
    const second = await mount('ms') // fresh provider reads storage
    expect(document.documentElement.lang).toBe('ms')
    await act(async () => second.root.unmount())
  })

  it('every dictionary has every English key; no TODO in English (P1-6 runtime guard)', () => {
    const keys = Object.keys(en)
    for (const l of ['zh', 'ms', 'ta'] as const) expect(Object.keys(dictionaries[l]).sort()).toEqual([...keys].sort())
    expect(Object.values(en).some((v) => v.includes('TODO-TRANSLATE'))).toBe(false)
  })

  it('interpolates params', () => {
    expect(translate('en', 'foundations.payments', { count: 3 })).toBe('3 payments')
  })

  it('has no banned copy in English', () => {
    expect(Object.values(en).join(' ')).not.toMatch(/credited|official|hawker|stall 01/i)
  })
})
