import { describe, expect, it } from 'vitest'
import { initialState, isCameraActive, payReducer, type PayEvent, type PayState } from './payMachine'

const run = (events: PayEvent[], from: PayState = initialState) => events.reduce(payReducer, from)
const VALID = 'CDC1|A-1,A-2,A-3|15|20261231|N1'

describe('payMachine', () => {
  it('routes permission results', () => {
    expect(run([{ type: 'permission', state: 'prompt' }]).name).toBe('explainer')
    expect(run([{ type: 'permission', state: 'granted' }]).name).toBe('starting')
    expect(run([{ type: 'permission', state: 'denied' }]).name).toBe('blocked')
    expect(run([{ type: 'permission', state: 'unsupported' }]).name).toBe('noCamera')
  })
  it('explainer: Allow starts the camera, denial blocks, Not now offers fallbacks', () => {
    const e = run([{ type: 'permission', state: 'prompt' }])
    expect(payReducer(e, { type: 'allowResult', result: 'granted' }).name).toBe('starting')
    expect(payReducer(e, { type: 'allowResult', result: 'denied' }).name).toBe('blocked')
    expect(payReducer(e, { type: 'allowResult', result: 'no_camera' }).name).toBe('noCamera')
    expect(payReducer(e, { type: 'allowResult', result: 'error' }).name).toBe('cameraError')
    expect(payReducer(e, { type: 'notNow' }).name).toBe('noCamera')
  })
  it('blocked: Try again stays blocked until granted', () => {
    const b = run([{ type: 'permission', state: 'denied' }])
    expect(payReducer(b, { type: 'retryBlocked', permission: 'denied' })).toEqual({ name: 'blocked', stillBlocked: true })
    expect(payReducer(b, { type: 'retryBlocked', permission: 'granted' }).name).toBe('starting')
  })
  it('starting -> scanning -> detected -> sheet for a valid code, and only one read counts', () => {
    const scanning = run([{ type: 'permission', state: 'granted' }, { type: 'cameraReady' }])
    expect(scanning.name).toBe('scanning')
    const detected = payReducer(scanning, { type: 'read', text: VALID, source: 'camera' })
    expect(detected.name).toBe('detected')
    expect(isCameraActive(detected)).toBe(true)
    // a second read while detected is ignored
    expect(payReducer(detected, { type: 'read', text: 'other', source: 'camera' })).toBe(detected)
    const sheet = payReducer(detected, { type: 'detectedDone' })
    expect(sheet.name).toBe('sheet')
    expect(payReducer(sheet, { type: 'read', text: VALID, source: 'camera' })).toBe(sheet)
    expect(payReducer(sheet, { type: 'scanAgain' })).toEqual({ name: 'scanning', slow: false })
  })
  it('reaches not_cdc, url, unreadable and the slow hint', () => {
    const scanning: PayState = { name: 'scanning', slow: false }
    const end = (text: string) => run([{ type: 'read', text, source: 'camera' }, { type: 'detectedDone' }], scanning)
    expect(end('hello').name).toBe('not_cdc')
    expect(end('https://bad.example.com/x')).toMatchObject({ name: 'url', domain: 'bad.example.com' })
    expect(payReducer(scanning, { type: 'readEmpty' }).name).toBe('unreadable')
    expect(payReducer(scanning, { type: 'slow' })).toEqual({ name: 'scanning', slow: true })
  })
  it('camera errors map to blocked / noCamera / cameraError', () => {
    const s: PayState = { name: 'starting' }
    expect(payReducer(s, { type: 'cameraError', kind: 'permission-denied' }).name).toBe('blocked')
    expect(payReducer(s, { type: 'cameraError', kind: 'no-camera' }).name).toBe('noCamera')
    expect(payReducer(s, { type: 'cameraError', kind: 'other' }).name).toBe('cameraError')
    expect(payReducer({ name: 'cameraError' }, { type: 'scanAgain' }).name).toBe('checkingPermission')
  })
  it('manual entry and upload reach the sheet without the camera', () => {
    expect(run([{ type: 'manual' }, { type: 'read', text: VALID, source: 'manual' }]).name).toBe('sheet')
    expect(run([{ type: 'upload' }, { type: 'read', text: VALID, source: 'upload' }]).name).toBe('sheet')
    expect(run([{ type: 'upload' }, { type: 'uploadFailed' }])).toEqual({ name: 'upload', failed: true })
    const sheet = run([{ type: 'manual' }, { type: 'read', text: VALID, source: 'manual' }])
    expect(isCameraActive(sheet)).toBe(false)
    expect(payReducer(sheet, { type: 'scanAgain' }).name).toBe('manualEntry')
  })
  it('confirm only works from the sheet', () => {
    expect(payReducer({ name: 'scanning', slow: false }, { type: 'confirm' }).name).toBe('scanning')
    const sheet = run([{ type: 'manual' }, { type: 'read', text: VALID, source: 'manual' }])
    expect(payReducer(sheet, { type: 'confirm' }).name).toBe('confirming')
  })
})
