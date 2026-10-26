import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  labelledBy: string
  /** 'assertive' announces errors and results straight away. */
  children: ReactNode
}

/**
 * Bottom sheet used for every scan result. Focus moves into it when it opens.
 * It sits over the camera (or a plain page for typed/uploaded codes), never navigates.
 */
export function BottomPanel({ labelledBy, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-live="assertive"
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-[30rem] overflow-y-auto rounded-t-[1.5rem] bg-surface px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] text-ink shadow-[0_-8px_24px_rgb(0_0_0/0.3)] outline-none"
      >
        <div aria-hidden className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}
