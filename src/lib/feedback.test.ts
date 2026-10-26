import { afterEach, describe, expect, it, vi } from 'vitest'
import { playFailure, playSuccess } from './feedback'

function stubAudio() {
  const osc = { type: '', frequency: { value: 0 }, connect: vi.fn(function (this: unknown) { return { connect: vi.fn() } }), start: vi.fn(), stop: vi.fn() }
  const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }
  const ctor = vi.fn(function () {
    return { state: 'running', currentTime: 0, destination: {}, createOscillator: () => osc, createGain: () => gain, resume: vi.fn() }
  })
  vi.stubGlobal('AudioContext', ctor)
  window.AudioContext = ctor as unknown as typeof AudioContext
  return { osc }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('feedback (P4-6)', () => {
  it('plays the chime when sound is on', () => {
    const { osc } = stubAudio()
    playSuccess({ soundOn: true, hapticsOn: false })
    expect(osc.start).toHaveBeenCalledTimes(3)
  })
  it('plays nothing when muted', () => {
    const { osc } = stubAudio()
    playSuccess({ soundOn: false, hapticsOn: false })
    playFailure({ soundOn: false, hapticsOn: false })
    expect(osc.start).not.toHaveBeenCalled()
  })
  it('vibrates only when vibration is on and supported', () => {
    stubAudio()
    const vibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
    playSuccess({ soundOn: false, hapticsOn: false })
    expect(vibrate).not.toHaveBeenCalled()
    playFailure({ soundOn: false, hapticsOn: true })
    expect(vibrate).toHaveBeenCalledTimes(1)
    delete (navigator as unknown as { vibrate?: unknown }).vibrate
  })
})
