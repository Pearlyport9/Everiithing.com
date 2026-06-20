'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ open, onClose, children }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', animation: 'fadeUp 200ms ease-out' }}
      >
        <div className="sticky top-0 flex items-center justify-between px-6 pt-5 pb-3 border-b z-10" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', borderColor: 'var(--color-outlineVariant)' }}>
          <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-onSurface)' }}>
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border flex items-center justify-center bg-transparent cursor-pointer transition-colors hover:bg-token-surfaceContainerLow"
            style={{ borderColor: 'var(--color-outlineVariant)' }}
            aria-label="Close"
          >
            <X size={16} style={{ color: 'var(--color-onSurfaceVariant)' }} />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
