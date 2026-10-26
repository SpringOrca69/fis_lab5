import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** One disclosure row: a 56px button that shows or hides its answer. */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className={className}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-tap-pay w-full items-center justify-between gap-3 py-2 text-left text-base font-bold"
        >
          {title}
          <ChevronDown aria-hidden className={cn('size-6 shrink-0 text-brand-700 transition-transform', open && 'rotate-180')} />
        </button>
      </h3>
      <div id={id} hidden={!open} className="pb-3 text-base">
        {children}
      </div>
    </div>
  )
}
