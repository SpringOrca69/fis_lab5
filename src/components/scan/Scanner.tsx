import { Scanner as QrScanner, type IDetectedBarcode, type IScannerError } from '@yudiel/react-qr-scanner'
import { CircleHelp, Flashlight, Check, Keyboard, WifiOff, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/i18n/context'
import { setTorch, torchSupported, trackOf } from '@/lib/camera'
import { useIsOnline } from '@/lib/offline'
import { cn } from '@/lib/utils'

export const SLOW_HINT_MS = 10_000
export const READ_FLASH_MS = 400

interface Props {
  /** True from the moment a code is read until "Scan again". Keeps the frame frozen. */
  paused: boolean
  /** True while waiting for the first video frame. */
  starting: boolean
  /** Shows the green frame + tick. */
  read: boolean
  slow: boolean
  soundOn: boolean
  hapticsOn: boolean
  onReady: () => void
  onRead: (text: string) => void
  onReadEmpty: () => void
  onSlow: () => void
  onError: (kind: 'permission-denied' | 'no-camera' | 'other') => void
  onCancel: () => void
  onHelp: () => void
  onManual: () => void
  /** Panel (result card) drawn over the bottom controls. */
  children?: ReactNode
}

function mapError(e: IScannerError): 'permission-denied' | 'no-camera' | 'other' {
  if (e.kind === 'permission-denied' || e.kind === 'security') return 'permission-denied'
  if (e.kind === 'no-camera') return 'no-camera'
  return 'other'
}

function CtrlButton({ onClick, Icon, label, pressed, hidden, returnFocus }: { returnFocus?: boolean; onClick: () => void; Icon: typeof X; label: string; pressed?: boolean; hidden?: boolean }) {
  if (hidden) return null
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      data-return-focus={returnFocus ? '' : undefined}
      className={cn(
        'flex min-h-tap-pay min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-1 py-1.5 text-sm font-bold text-white',
        pressed ? 'bg-white text-brand-900' : 'bg-white/15 hover:bg-white/25',
      )}
    >
      <Icon aria-hidden className="size-6" />
      <span className="max-w-full text-center break-words">{label}</span>
    </button>
  )
}

/**
 * Full-screen rear camera with a corner-guide viewfinder. Everything is
 * overlaid on a semi-opaque backing so text stays readable on any scene.
 * The first code read pauses the camera at once (one read, one sheet).
 */
export function CameraView(p: Props) {
  const { t } = useI18n()
  const ref = useRef<{ getStream: () => MediaStream | null; getVideoElement: () => HTMLVideoElement | null } | null>(null)
  const handled = useRef(false)
  const [torchAvailable, setTorchAvailable] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const { paused, starting, onReady, onSlow } = p

  // Re-arm after "Scan again".
  useEffect(() => {
    if (!paused) handled.current = false
  }, [paused])

  // Wait for the first real video frame, then tell Pay we are scanning.
  useEffect(() => {
    if (!starting) return
    const id = window.setInterval(() => {
      const video = ref.current?.getVideoElement()
      const stream = ref.current?.getStream()
      if (video && stream && video.readyState >= 2) {
        setTorchAvailable(torchSupported(trackOf(stream)))
        onReady()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [starting, onReady])

  // Hint after ~10s without a read.
  const scanning = !starting && !paused
  useEffect(() => {
    if (!scanning) return
    const id = window.setTimeout(onSlow, SLOW_HINT_MS)
    return () => window.clearTimeout(id)
  }, [scanning, onSlow])

  const handleScan = (codes: IDetectedBarcode[]) => {
    if (handled.current || paused) return
    const text = codes.find((c) => c.rawValue)?.rawValue
    handled.current = true
    // Torch goes off the moment a code is read.
    void setTorch(trackOf(ref.current?.getStream() ?? null), false)
    setTorchOn(false)
    if (!text) {
      p.onReadEmpty()
      return
    }
    if (p.hapticsOn && 'vibrate' in navigator) navigator.vibrate(60)
    p.onRead(text)
  }

  const toggleTorch = async () => {
    const next = !torchOn
    const ok = await setTorch(trackOf(ref.current?.getStream() ?? null), next)
    if (ok) setTorchOn(next)
  }

  const offline = !useIsOnline()
  const status = p.read ? t('pay.status.read') : starting ? t('pay.starting') : paused ? '' : t('pay.status.scanning')

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[#031412] text-white">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <QrScanner
          ref={ref}
          onScan={handleScan}
          onError={(e) => p.onError(mapError(e))}
          paused={paused}
          sound={p.soundOn}
          formats={['qr_code']}
          constraints={{ facingMode: 'environment' }}
          components={{ finder: false, torch: false, onOff: false, zoom: false }}
          styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
        />

        {offline && (
          <div role="status" className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-warning-tint px-4 py-2 text-base font-bold text-warning">
            <WifiOff aria-hidden className="size-6 shrink-0" />
            {t('offline.banner')}
          </div>
        )}

        {/* Hint, on a backing so it reads over any scene */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 bg-black/60 px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-center">
          <p className="text-lg font-bold">{t('pay.title')}</p>
          <p className="text-base">{t('pay.hint')}</p>
          <p aria-live="polite" className="text-base font-bold">
            {status}
          </p>
          {p.slow && !paused && <p className="rounded-control bg-black/70 px-3 py-2 text-base">{t('pay.hintSlow')}</p>}
        </div>

        {/* Viewfinder */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            aria-hidden
            className={cn(
              'relative size-64 transition-colors duration-200',
              p.read ? 'text-[#4ade80]' : 'text-white',
              starting && 'animate-pulse',
            )}
          >
            {(['top-0 left-0 border-t-[6px] border-l-[6px] rounded-tl-2xl', 'top-0 right-0 border-t-[6px] border-r-[6px] rounded-tr-2xl', 'bottom-0 left-0 border-b-[6px] border-l-[6px] rounded-bl-2xl', 'bottom-0 right-0 border-b-[6px] border-r-[6px] rounded-br-2xl'] as const).map((c) => (
              <span key={c} className={cn('absolute size-12 border-current', c)} />
            ))}
            {p.read && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-20 items-center justify-center rounded-full bg-[#166534] ring-4 ring-[#4ade80]">
                  <Check className="size-12 text-white" strokeWidth={3.5} />
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls: thumb zone */}
      <div className="bg-black/80 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="mx-auto flex max-w-[30rem] gap-2">
          <CtrlButton
            hidden={!torchAvailable}
            onClick={() => void toggleTorch()}
            Icon={Flashlight}
            label={`${t('pay.torch')}: ${torchOn ? t('pay.torch.on') : t('pay.torch.off')}`}
            pressed={torchOn}
          />
          <CtrlButton returnFocus onClick={p.onManual} Icon={Keyboard} label={t('pay.typeCode')} />
          <CtrlButton onClick={p.onHelp} Icon={CircleHelp} label={t('pay.help')} />
          <CtrlButton onClick={p.onCancel} Icon={X} label={t('pay.cancel')} />
        </div>
        <p className="mt-2 text-center text-sm text-white/85">{t('app.disclaimer')}</p>
      </div>

      {p.children}
    </div>
  )
}
