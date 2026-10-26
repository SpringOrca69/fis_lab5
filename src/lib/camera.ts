export type PermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported'
export type BrowserKind = 'chrome' | 'safari' | 'samsung'

export const CAMERA_KEY = 'heartpay:camera'

function stored(): PermissionState | null {
  try {
    const v = localStorage.getItem(CAMERA_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function rememberPermission(state: 'granted' | 'denied'): void {
  try {
    localStorage.setItem(CAMERA_KEY, state)
  } catch {
    /* ignore */
  }
}

export function cameraSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}

/** Permissions API first; Safari lacks it for camera, so fall back to the last known result. */
export async function checkPermission(): Promise<PermissionState> {
  if (!cameraSupported()) return 'unsupported'
  try {
    const status = await navigator.permissions.query({ name: 'camera' as PermissionName })
    if (status.state === 'granted' || status.state === 'denied') rememberPermission(status.state)
    return status.state
  } catch {
    return stored() ?? 'prompt'
  }
}

export type RequestResult = 'granted' | 'denied' | 'no_camera' | 'error'

/**
 * Asks the browser for the camera. Call only from a tap handler (iOS needs a
 * user gesture). The probe stream is stopped at once; the scanner opens its own.
 */
export async function requestCamera(): Promise<RequestResult> {
  if (!cameraSupported()) return 'no_camera'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    stream.getTracks().forEach((t) => t.stop())
    rememberPermission('granted')
    return 'granted'
  } catch (e) {
    const name = (e as { name?: string }).name
    if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
      rememberPermission('denied')
      return 'denied'
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'no_camera'
    return 'error'
  }
}

export function detectBrowser(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): BrowserKind {
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'safari'
  return 'chrome'
}

export function trackOf(stream: MediaStream | null): MediaStreamTrack | null {
  return stream?.getVideoTracks()[0] ?? null
}

export function torchSupported(track: MediaStreamTrack | null): boolean {
  const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
  return !!caps?.torch
}

export async function setTorch(track: MediaStreamTrack | null, on: boolean): Promise<boolean> {
  if (!track) return false
  try {
    await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] })
    return true
  } catch {
    return false
  }
}
