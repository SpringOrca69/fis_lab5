import { CameraOff, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useReducer, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { CameraBlocked } from '@/components/scan/CameraBlocked'
import { Fallbacks } from '@/components/scan/Fallbacks'
import { ImageUpload } from '@/components/scan/ImageUpload'
import { ManualEntry } from '@/components/scan/ManualEntry'
import { MessagePanel } from '@/components/scan/MessagePanel'
import { PermissionPrompt } from '@/components/scan/PermissionPrompt'
import { ResultSheet } from '@/components/scan/ResultSheet'
import { CameraView, READ_FLASH_MS } from '@/components/scan/Scanner'
import { useStore } from '@/data/storeContext'
import { useI18n } from '@/i18n/context'
import { checkPermission, requestCamera } from '@/lib/camera'
import { decodeImage } from '@/lib/decodeImage'
import { initialState, isCameraActive, payReducer } from './pay/payMachine'

/**
 * Screen 3: Accept CDC payment. A state machine over the scan components
 * (see pay/payMachine.ts). Confirm is a placeholder until Phase 4.
 */
export default function Pay() {
  const { t } = useI18n()
  const { state: store } = useStore()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(payReducer, initialState)
  const [busy, setBusy] = useState(false)

  // checkingPermission: look up the permission without prompting.
  useEffect(() => {
    if (state.name !== 'checkingPermission') return
    let cancelled = false
    void checkPermission().then((p) => {
      if (!cancelled) dispatch({ type: 'permission', state: p })
    })
    return () => {
      cancelled = true
    }
  }, [state.name])

  // Green frame + tick for ~400ms, then the result.
  useEffect(() => {
    if (state.name !== 'detected') return
    const id = window.setTimeout(() => dispatch({ type: 'detectedDone' }), READ_FLASH_MS)
    return () => window.clearTimeout(id)
  }, [state.name])

  const allow = async () => {
    setBusy(true)
    const result = await requestCamera() // runs inside the tap, as iOS requires
    setBusy(false)
    dispatch({ type: 'allowResult', result })
  }

  const retryBlocked = async () => {
    setBusy(true)
    let p = await checkPermission()
    if (p === 'prompt') p = (await requestCamera()) === 'granted' ? 'granted' : 'denied'
    setBusy(false)
    dispatch({ type: 'retryBlocked', permission: p })
  }

  const onReady = useCallback(() => dispatch({ type: 'cameraReady' }), [])
  const onSlow = useCallback(() => dispatch({ type: 'slow' }), [])
  const onRead = useCallback((text: string) => dispatch({ type: 'read', text, source: 'camera' }), [])
  const onReadEmpty = useCallback(() => dispatch({ type: 'readEmpty' }), [])
  const onError = useCallback((kind: 'permission-denied' | 'no-camera' | 'other') => dispatch({ type: 'cameraError', kind }), [])

  // Camera layer: full screen, no bottom nav.
  if (isCameraActive(state)) {
    const running = state.name === 'starting' || state.name === 'scanning'
    return (
      <CameraView
        paused={!running}
        starting={state.name === 'starting'}
        read={state.name === 'detected'}
        slow={state.name === 'scanning' && state.slow}
        soundOn={store.settings.soundOn}
        hapticsOn={store.settings.hapticsOn}
        onReady={onReady}
        onRead={onRead}
        onReadEmpty={onReadEmpty}
        onSlow={onSlow}
        onError={onError}
        onCancel={() => navigate('/home')}
        onHelp={() => navigate('/help')}
        onManual={() => dispatch({ type: 'manual' })}
      >
        {state.name === 'unreadable' && (
          <MessagePanel variant={{ kind: 'unreadable' }} onScanAgain={() => dispatch({ type: 'scanAgain' })} onManual={() => dispatch({ type: 'manual' })} />
        )}
        {state.name === 'not_cdc' && <MessagePanel variant={{ kind: 'not_cdc' }} onScanAgain={() => dispatch({ type: 'scanAgain' })} />}
        {state.name === 'url' && <MessagePanel variant={{ kind: 'url', domain: state.domain }} onScanAgain={() => dispatch({ type: 'scanAgain' })} />}
        {state.name === 'sheet' && (
          <ResultSheet result={state.result} onConfirm={() => dispatch({ type: 'confirm' })} onCancel={() => dispatch({ type: 'scanAgain' })} />
        )}
      </CameraView>
    )
  }

  const fallbacks = <Fallbacks onManual={() => dispatch({ type: 'manual' })} onUpload={() => dispatch({ type: 'upload' })} />

  let body
  switch (state.name) {
    case 'checkingPermission':
      return (
        <AppShell title={t('pay.title')}>
          <p role="status" aria-live="polite" className="text-base">
            {t('pay.checking')}
          </p>
        </AppShell>
      )
    case 'explainer':
      body = <PermissionPrompt busy={busy} onAllow={() => void allow()} onNotNow={() => dispatch({ type: 'notNow' })} />
      break
    case 'blocked':
      body = (
        <>
          <CameraBlocked stillBlocked={state.stillBlocked} busy={busy} onTryAgain={() => void retryBlocked()} />
          {fallbacks}
        </>
      )
      break
    case 'noCamera':
    case 'cameraError': {
      const noCam = state.name === 'noCamera'
      const Icon = noCam ? CameraOff : TriangleAlert
      body = (
        <>
          <section aria-labelledby="cam-h" className="rounded-card bg-surface p-5 shadow-card">
            <Icon aria-hidden className="size-9 text-warning" />
            <h2 id="cam-h" className="mt-3 text-title font-bold">
              {noCam ? t('pay.noCamera.title') : t('pay.cameraError.title')}
            </h2>
            <p className="mt-2 text-base">{noCam ? t('pay.noCamera.body') : t('pay.cameraError.body')}</p>
            {!noCam && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'scanAgain' })}
                className="mt-4 min-h-tap-pay w-full rounded-control bg-brand-700 px-4 text-lg font-bold text-white hover:bg-brand-600"
              >
                {t('common.tryAgain')}
              </button>
            )}
          </section>
          {fallbacks}
        </>
      )
      break
    }
    case 'manualEntry':
      body = <ManualEntry onSubmit={(text) => dispatch({ type: 'read', text, source: 'manual' })} onUseCamera={() => dispatch({ type: 'useCamera' })} />
      break
    case 'upload':
      body = (
        <ImageUpload
          failed={state.failed}
          decode={decodeImage}
          onText={(text) => dispatch({ type: 'read', text, source: 'upload' })}
          onFail={() => dispatch({ type: 'uploadFailed' })}
          onUseCamera={() => dispatch({ type: 'useCamera' })}
        />
      )
      break
    case 'confirming':
      body = (
        <section className="rounded-card bg-surface p-5 shadow-card">
          <p role="status" className="text-base">
            {t('pay.confirm.placeholder')}
          </p>
          <Link to="/home" className="mt-4 flex min-h-tap-pay items-center justify-center rounded-control bg-brand-700 px-4 text-lg font-bold text-white">
            {t('nav.home')}
          </Link>
        </section>
      )
      break
    case 'sheet':
    case 'not_cdc':
    case 'url':
      // Typed or uploaded code: the same panels, over a plain page.
      body = null
      break
    default:
      body = null
  }

  return (
    <AppShell title={t('pay.title')} hideNav={state.name === 'sheet' || state.name === 'not_cdc' || state.name === 'url'}>
      <div className="flex flex-col gap-4">{body}</div>
      {state.name === 'sheet' && (
        <ResultSheet result={state.result} onConfirm={() => dispatch({ type: 'confirm' })} onCancel={() => dispatch({ type: 'scanAgain' })} />
      )}
      {state.name === 'not_cdc' && <MessagePanel variant={{ kind: 'not_cdc' }} onScanAgain={() => dispatch({ type: 'scanAgain' })} />}
      {state.name === 'url' && <MessagePanel variant={{ kind: 'url', domain: state.domain }} onScanAgain={() => dispatch({ type: 'scanAgain' })} />}
    </AppShell>
  )
}
