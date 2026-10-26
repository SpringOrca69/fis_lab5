import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StoreProvider } from '@/data/store'
import { I18nProvider } from '@/i18n/I18nProvider'
import { en } from '@/i18n/en'
import Demo from '../Demo'
import Pay from '../Pay'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mocks = vi.hoisted(() => ({ decode: vi.fn(), permission: 'prompt' as string }))

vi.mock('@yudiel/react-qr-scanner', async () => {
  const React = await import('react')
  const Scanner = React.forwardRef(function FakeScanner(
    { onScan, paused }: { onScan: (c: { rawValue: string }[]) => void; paused: boolean },
    ref: React.Ref<unknown>,
  ) {
    React.useImperativeHandle(ref, () => ({ getVideoElement: () => ({ readyState: 4 }), getStream: () => ({ getVideoTracks: () => [] }) }))
    return (
      <button type="button" data-testid="fake-scanner" data-paused={String(paused)} onClick={() => onScan([{ rawValue: 'CDC1|SUPERMARKET|A-1,A-2,A-3|15|20261231|N1' }])}>
        fake
      </button>
    )
  })
  return { Scanner }
})
vi.mock('@/lib/camera', async (orig) => ({
  ...(await orig<typeof import('@/lib/camera')>()),
  checkPermission: async () => mocks.permission,
  requestCamera: async () => 'granted',
}))
vi.mock('@/lib/decodeImage', () => ({ decodeImage: (f: File) => mocks.decode(f) }))

let root: Root
let host: HTMLDivElement

async function mount(ui: React.ReactNode) {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () =>
    root.render(
      <I18nProvider>
        <StoreProvider>
          <MemoryRouter>{ui}</MemoryRouter>
        </StoreProvider>
      </I18nProvider>,
    ),
  )
}
const flush = () => act(async () => {})
const button = (text: string) => [...document.querySelectorAll('button, a')].find((b) => b.textContent?.includes(text)) as HTMLElement
const click = (el: Element) => act(async () => el.dispatchEvent(new MouseEvent('click', { bubbles: true })))

beforeEach(() => {
  localStorage.clear()
  mocks.permission = 'prompt'
  mocks.decode.mockReset()
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
})

describe('/demo', () => {
  it('renders a QR for each of the 7 scenarios', async () => {
    await mount(<Demo />)
    const items = document.querySelectorAll('[data-testid^="demo-"]')
    expect(items).toHaveLength(7)
    items.forEach((li) => expect(li.querySelector('svg')).not.toBeNull())
  })
})

describe('Pay flow', () => {
  it('shows the explainer first, Not now offers fallbacks', async () => {
    await mount(<Pay />)
    await flush()
    expect(document.body.textContent).toContain(en['pay.explain.title'])
    await click(button(en['pay.explain.notNow']))
    expect(document.body.textContent).toContain(en['pay.noCamera.title'])
    expect(document.body.textContent).toContain(en['pay.fallback.manual'])
  })

  it('Allow camera starts the camera view (no bottom nav) ', async () => {
    await mount(<Pay />)
    await flush()
    await click(button(en['pay.explain.allow']))
    expect(document.querySelector('[data-testid="fake-scanner"]')).not.toBeNull()
    expect(document.querySelector('nav')).toBeNull()
  })

  it('granted permission skips the explainer', async () => {
    mocks.permission = 'granted'
    await mount(<Pay />)
    await flush()
    expect(document.body.textContent).not.toContain(en['pay.explain.title'])
    expect(document.querySelector('[data-testid="fake-scanner"]')).not.toBeNull()
  })

  it('denied permission shows steps in three browser tabs', async () => {
    mocks.permission = 'denied'
    await mount(<Pay />)
    await flush()
    expect(document.body.textContent).toContain(en['pay.blocked.title'])
    expect(document.querySelectorAll('[role="tab"]')).toHaveLength(3)
    await click(button(en['pay.browser.samsung']))
    expect(document.body.textContent).toContain(en['pay.blocked.samsung.2'])
  })

  it('manual entry reaches the sheet; focus moves into it; Confirm and Cancel offered', async () => {
    mocks.permission = 'denied'
    await mount(<Pay />)
    await flush()
    await click(button(en['pay.fallback.manual']))
    const input = document.getElementById('voucher-code') as HTMLInputElement
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'CDC1|SUPERMARKET|A-1,A-2,A-3|15|20261231|N1')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click(button(en['pay.manual.submit']))
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    expect(dialog).not.toBeNull()
    expect(document.activeElement).toBe(dialog)
    expect(dialog.textContent).toContain('$15.00')
    expect(dialog.textContent).toContain('3 vouchers × $5')
    expect(dialog.textContent).toContain('31 Dec 2026')
    expect(button(en['pay.sheet.confirm'])).toBeTruthy()
    expect(button(en['pay.sheet.cancel'])).toBeTruthy()
    await click(button(en['pay.sheet.details']))
    expect(dialog.textContent).toContain('A-1, A-2, A-3')
  })

  it('Cancel closes the sheet and focus is not left on body', async () => {
    mocks.permission = 'denied'
    await mount(<Pay />)
    await flush()
    await click(button(en['pay.fallback.manual']))
    const input = document.getElementById('voucher-code') as HTMLInputElement
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'CDC1|SUPERMARKET|A-1,A-2,A-3|15|20261231|N1')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await click(button(en['pay.manual.submit']))
    await click(button(en['pay.sheet.cancel']))
    await flush()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).not.toBe(document.body)
  })

  it('image upload reaches the sheet; failure shows a message', async () => {
    mocks.permission = 'denied'
    await mount(<Pay />)
    await flush()
    await click(button(en['pay.fallback.upload']))
    const input = document.querySelector('[data-testid="upload-input"]') as HTMLInputElement
    const pick = async () => {
      Object.defineProperty(input, 'files', { value: [new File(['x'], 'a.png')], configurable: true })
      await act(async () => input.dispatchEvent(new Event('change', { bubbles: true })))
    }
    mocks.decode.mockResolvedValueOnce(null)
    await pick()
    expect(document.body.textContent).toContain(en['pay.upload.fail'])
    mocks.decode.mockResolvedValueOnce('CDC1|SUPERMARKET|A-1|5|20261231|N2')
    await pick()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('$5.00')
  })

  it('camera read pauses the scanner at once and opens exactly one sheet', async () => {
    vi.useFakeTimers()
    try {
      mocks.permission = 'granted'
      await mount(<Pay />)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300) // camera "ready" -> scanning
      })
      const scanner = () => document.querySelector('[data-testid="fake-scanner"]') as HTMLElement
      expect(scanner().dataset.paused).toBe('false')
      await act(async () => {
        scanner().click()
        scanner().click() // same frame, second read: must be ignored
      })
      expect(scanner().dataset.paused).toBe('true')
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(0) // still the green-frame moment
      await act(async () => {
        await vi.advanceTimersByTimeAsync(450)
      })
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
      await act(async () => {
        scanner().click() // camera is paused behind the sheet; a stray read changes nothing
      })
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
