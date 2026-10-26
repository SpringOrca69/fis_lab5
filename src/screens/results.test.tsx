import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StoreProvider } from '@/data/store'
import { I18nProvider } from '@/i18n/I18nProvider'
import { en } from '@/i18n/en'
import { setSimulatedOffline } from '@/lib/offline'
import Pay from './Pay'
import PaymentFailed from './PaymentFailed'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@yudiel/react-qr-scanner', () => ({ Scanner: () => null }))
vi.mock('@/lib/camera', async (orig) => ({
  ...(await orig<typeof import('@/lib/camera')>()),
  checkPermission: async () => 'denied',
  requestCamera: async () => 'granted',
}))
const chime = vi.hoisted(() => ({ success: vi.fn(), failure: vi.fn() }))
vi.mock('@/lib/feedback', async (orig) => ({
  ...(await orig<typeof import('@/lib/feedback')>()),
  playSuccess: chime.success,
  playFailure: chime.failure,
}))

let root: Root
let host: HTMLDivElement

async function mount(initial: string) {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () =>
    root.render(
      <I18nProvider>
        <StoreProvider>
          <MemoryRouter initialEntries={[initial]}>
            <Routes>
              <Route path="/pay" element={<Pay />} />
              <Route path="/home" element={<p>HOME</p>} />
              <Route path="/pay/failed" element={<PaymentFailed />} />
              <Route path="/pay/success/:txId" element={<SuccessProbe />} />
            </Routes>
          </MemoryRouter>
        </StoreProvider>
      </I18nProvider>,
    ),
  )
}
import PaymentSuccess from './PaymentSuccess'
const SuccessProbe = () => <PaymentSuccess />

const flush = () => act(async () => {})
const button = (text: string) => [...document.querySelectorAll('button, a')].find((b) => b.textContent?.includes(text)) as HTMLElement
const click = (el: Element) => act(async () => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))

async function payWith(code: string) {
  await flush()
  await click(button(en['pay.fallback.manual']))
  const input = document.getElementById('voucher-code') as HTMLInputElement
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, code)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await click(button(en['pay.manual.submit']))
  await click(button(en['pay.sheet.confirm']))
}

const VALID = 'CDC1|R-1,R-2,R-3|15|20261231|N1'
const storedTxCount = () => (JSON.parse(localStorage.getItem('heartpay:v1')!).transactions as unknown[]).length

beforeEach(() => {
  localStorage.clear()
  chime.success.mockReset()
  chime.failure.mockReset()
})
afterEach(async () => {
  setSimulatedOffline(false)
  await act(async () => root.unmount())
  host.remove()
})

describe('confirm flow', () => {
  it('P4-2 success adds one transaction and shows 4a with three rows', async () => {
    await mount('/pay')
    const before = storedTxCount()
    await payWith(VALID)
    await flush()
    const text = document.body.textContent!
    expect(text).toContain('Payment confirmed')
    expect(text).toContain('$15.00')
    expect(text).toContain('Paid to your bank tonight at midnight')
    expect(text).not.toMatch(/credited/i)
    expect(document.querySelectorAll('dl')[0].children).toHaveLength(3)
    expect(chime.success).toHaveBeenCalledTimes(1)
    expect(storedTxCount()).toBe(before + 1)
  })

  it('P4-3 the same code twice gives already_used', async () => {
    await mount('/pay')
    await payWith(VALID)
    await act(async () => root.unmount())
    host.remove()
    await mount('/pay')
    const n = storedTxCount()
    await payWith(VALID)
    await flush()
    expect(document.body.textContent).toContain(en['result.reason.already_used'])
    expect(document.body.textContent).toContain('No money was taken')
    expect(storedTxCount()).toBe(n)
    expect(chime.failure).toHaveBeenCalledTimes(1)
  })

  it('P4-4 offline blocks confirm: network failure, nothing charged, nothing stored', async () => {
    setSimulatedOffline(true)
    await mount('/pay')
    await payWith(VALID)
    await flush()
    expect(document.body.textContent).toContain('Nothing was charged')
    expect(document.body.textContent).toContain('No money was taken')
    const stored = JSON.parse(localStorage.getItem('heartpay:v1')!)
    expect(stored.vouchers).toHaveLength(0)
  })
})

describe('failed screen', () => {
  it('P4-5 "No money was taken" is the largest text; actions go to /pay and /help', async () => {
    await mount('/pay/failed?reason=expired')
    await flush()
    const big = [...document.querySelectorAll('p, h2')].find((e) => e.textContent === 'No money was taken')!
    expect(big.className).toContain('text-amount')
    const headline = [...document.querySelectorAll('h2')].find((e) => e.textContent === "Payment didn't go through")!
    expect(headline.className).not.toContain('text-amount')
    expect(document.body.textContent).toContain(en['result.reason.expired'])
    expect(button(en['common.tryAgain']).getAttribute('href')).toBe('/pay')
    expect(button(en['pay.callHelper']).getAttribute('href')).toBe('/help')
    expect(document.querySelector('svg')).not.toBeNull()
  })
  it('unknown reason falls back to a generic line', async () => {
    await mount('/pay/failed?reason=zzz')
    await flush()
    expect(document.body.textContent).toContain(en['result.reason.generic'])
  })
})
