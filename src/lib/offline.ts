import { useSyncExternalStore } from 'react'

const KEY = 'heartpay:simOffline'
const EVENT = 'heartpay:online-change'

/** Demo toggle on /demo. Forces the offline path even with a working connection. */
export function isSimulatedOffline(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setSimulatedOffline(on: boolean): void {
  try {
    if (on) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** True only when the browser reports a connection and the demo toggle is off. */
export function isOnline(): boolean {
  return !isSimulatedOffline() && (typeof navigator === 'undefined' || navigator.onLine !== false)
}

function subscribe(cb: () => void): () => void {
  const events = [EVENT, 'online', 'offline', 'storage']
  events.forEach((e) => window.addEventListener(e, cb))
  return () => events.forEach((e) => window.removeEventListener(e, cb))
}

export function useIsOnline(): boolean {
  return useSyncExternalStore(subscribe, isOnline, () => true)
}
