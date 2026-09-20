import { Info } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

interface InfoTipProps {
  label: string
  children: string
}

export function InfoTip({ label, children }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const closeOutside = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', closeOutside)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', closeOutside)
    }
  }, [open])

  return (
    <span className="info-tip" ref={wrapperRef}>
      <button
        type="button"
        className="info-button"
        aria-label={`Informations : ${label}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <Info aria-hidden="true" size={14} strokeWidth={2.2} />
      </button>
      {open && (
        <span className="info-popover" id={id} role="tooltip">
          {children}
        </span>
      )}
    </span>
  )
}
