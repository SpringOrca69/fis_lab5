/** Sound and vibration for payment results. Both respect the Stall settings. */
export interface FeedbackSettings {
  soundOn: boolean
  hapticsOn: boolean
}

type Note = { freq: number; at: number; dur: number; gain: number; type: OscillatorType }

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  try {
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function play(notes: Note[]): void {
  const c = audio()
  if (!c) return
  const t0 = c.currentTime
  for (const n of notes) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = n.type
    osc.frequency.value = n.freq
    g.gain.setValueAtTime(0.0001, t0 + n.at)
    g.gain.exponentialRampToValueAtTime(n.gain, t0 + n.at + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur)
    osc.connect(g).connect(c.destination)
    osc.start(t0 + n.at)
    osc.stop(t0 + n.at + n.dur + 0.05)
  }
}

export function vibrate(pattern: number | number[], enabled: boolean): void {
  if (enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
}

/** Bright rising three-note chime. */
export function playSuccess(s: FeedbackSettings): void {
  if (s.soundOn)
    play([
      { freq: 659, at: 0, dur: 0.35, gain: 0.22, type: 'sine' },
      { freq: 880, at: 0.12, dur: 0.35, gain: 0.22, type: 'sine' },
      { freq: 1318, at: 0.24, dur: 0.6, gain: 0.22, type: 'sine' },
    ])
  vibrate([80, 50, 80], s.hapticsOn)
}

/** Soft low falling pair: clearly different from the chime, not alarming. */
export function playFailure(s: FeedbackSettings): void {
  if (s.soundOn)
    play([
      { freq: 330, at: 0, dur: 0.4, gain: 0.14, type: 'triangle' },
      { freq: 247, at: 0.22, dur: 0.6, gain: 0.14, type: 'triangle' },
    ])
  vibrate(250, s.hapticsOn)
}
