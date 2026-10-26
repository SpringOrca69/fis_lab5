import { parseQr, type QrResult } from '@/lib/parseQr'
import type { PermissionState } from '@/lib/camera'

/** How the code reached us decides where "Scan again" and "Cancel" go. */
export type Source = 'camera' | 'manual' | 'upload'

export type PayState =
  | { name: 'checkingPermission' }
  | { name: 'explainer' }
  | { name: 'blocked'; stillBlocked: boolean }
  | { name: 'starting' }
  | { name: 'scanning'; slow: boolean }
  | { name: 'detected'; result: QrResult; source: Source }
  | { name: 'unreadable' }
  | { name: 'not_cdc'; source: Source }
  | { name: 'url'; domain: string; source: Source }
  | { name: 'sheet'; result: Extract<QrResult, { kind: 'cdc' }>; source: Source }
  | { name: 'confirming'; result: Extract<QrResult, { kind: 'cdc' }> }
  | { name: 'noCamera' }
  | { name: 'cameraError' }
  | { name: 'manualEntry' }
  | { name: 'upload'; failed: boolean }

export type PayEvent =
  | { type: 'permission'; state: PermissionState }
  | { type: 'allowResult'; result: 'granted' | 'denied' | 'no_camera' | 'error' }
  | { type: 'notNow' }
  | { type: 'retryBlocked'; permission: PermissionState }
  | { type: 'cameraReady' }
  | { type: 'cameraError'; kind: 'permission-denied' | 'no-camera' | 'other' }
  | { type: 'slow' }
  | { type: 'read'; text: string; source: Source }
  | { type: 'readEmpty' }
  | { type: 'detectedDone' }
  | { type: 'scanAgain' }
  | { type: 'manual' }
  | { type: 'upload' }
  | { type: 'uploadFailed' }
  | { type: 'useCamera' }
  | { type: 'confirm' }

export const initialState: PayState = { name: 'checkingPermission' }

/** Camera layer (video behind overlays) is shown for these states when the code came from the camera. */
export function isCameraActive(s: PayState): boolean {
  switch (s.name) {
    case 'starting':
    case 'scanning':
      return true
    case 'detected':
    case 'not_cdc':
    case 'url':
    case 'sheet':
      return s.source === 'camera'
    case 'unreadable':
      return true
    default:
      return false
  }
}

function routeResult(result: QrResult, source: Source): PayState {
  if (result.kind === 'cdc') return { name: 'sheet', result, source }
  if (result.kind === 'url') return { name: 'url', domain: result.domain, source }
  return { name: 'not_cdc', source }
}

export function payReducer(s: PayState, e: PayEvent): PayState {
  switch (e.type) {
    case 'permission':
      if (s.name !== 'checkingPermission') return s
      if (e.state === 'granted') return { name: 'starting' }
      if (e.state === 'denied') return { name: 'blocked', stillBlocked: false }
      if (e.state === 'unsupported') return { name: 'noCamera' }
      return { name: 'explainer' }
    case 'allowResult':
      if (s.name !== 'explainer') return s
      if (e.result === 'granted') return { name: 'starting' }
      if (e.result === 'denied') return { name: 'blocked', stillBlocked: false }
      if (e.result === 'no_camera') return { name: 'noCamera' }
      return { name: 'cameraError' }
    case 'notNow':
      return s.name === 'explainer' ? { name: 'noCamera' } : s
    case 'retryBlocked':
      if (s.name !== 'blocked') return s
      return e.permission === 'granted' ? { name: 'starting' } : { name: 'blocked', stillBlocked: true }
    case 'cameraReady':
      return s.name === 'starting' ? { name: 'scanning', slow: false } : s
    case 'cameraError':
      if (s.name !== 'starting' && s.name !== 'scanning') return s
      if (e.kind === 'permission-denied') return { name: 'blocked', stillBlocked: false }
      if (e.kind === 'no-camera') return { name: 'noCamera' }
      return { name: 'cameraError' }
    case 'slow':
      return s.name === 'scanning' ? { ...s, slow: true } : s
    case 'read': {
      // Ignore reads once we are past scanning: one code, one sheet.
      const canRead = s.name === 'scanning' || s.name === 'manualEntry' || s.name === 'upload'
      if (!canRead) return s
      const result = parseQr(e.text)
      if (e.source === 'camera') return { name: 'detected', result, source: 'camera' }
      return routeResult(result, e.source)
    }
    case 'readEmpty':
      return s.name === 'scanning' ? { name: 'unreadable' } : s
    case 'detectedDone':
      return s.name === 'detected' ? routeResult(s.result, s.source) : s
    case 'scanAgain': {
      if (s.name === 'unreadable') return { name: 'scanning', slow: false }
      if (s.name === 'sheet' || s.name === 'not_cdc' || s.name === 'url') {
        if (s.source === 'manual') return { name: 'manualEntry' }
        if (s.source === 'upload') return { name: 'upload', failed: false }
        return { name: 'scanning', slow: false }
      }
      if (s.name === 'cameraError') return { name: 'checkingPermission' }
      return s
    }
    case 'manual':
      return { name: 'manualEntry' }
    case 'upload':
      return { name: 'upload', failed: false }
    case 'uploadFailed':
      return s.name === 'upload' ? { name: 'upload', failed: true } : s
    case 'useCamera':
      return { name: 'checkingPermission' }
    case 'confirm':
      return s.name === 'sheet' ? { name: 'confirming', result: s.result } : s
  }
}
