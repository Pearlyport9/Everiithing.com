'use client'

import { useState, useRef } from 'react'
import { ChevronDown, Loader2, UserCheck } from 'lucide-react'

interface Provider {
  id: string
  full_name: string
  verification_status: string
}

interface AssignProviderControlProps {
  bookingId: string
  onAssigned: (bookingId: string, providerId: string, providerName: string) => void
}

let providersCache: Provider[] | null = null
let providersPromise: Promise<void> | null = null

function ensureProviders(): Promise<Provider[]> {
  if (providersCache) return Promise.resolve(providersCache)
  if (!providersPromise) {
    providersPromise = fetch('/api/admin/providers')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          providersCache = data.data.filter((p: Provider) => p.verification_status === 'approved')
        }
      })
  }
  return providersPromise!.then(() => providersCache ?? [])
}

export function AssignProviderControl({ bookingId, onAssigned }: AssignProviderControlProps) {
  const [open, setOpen] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const fetchedRef = useRef(false)

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.bottom + 4,
        minWidth: Math.max(rect.width, 220),
      })
    }
    if (!fetchedRef.current) {
      setLoading(true)
      fetchedRef.current = true
      ensureProviders()
        .then(setProviders)
        .catch(() => setError('Failed to load providers'))
        .finally(() => setLoading(false))
    }
    setOpen(true)
  }

  const handleAssign = async (providerId: string, providerName: string) => {
    setAssigning(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId }),
      })
      const data = await res.json()
      if (data.success) {
        onAssigned(bookingId, providerId, providerName)
        setOpen(false)
      } else {
        setError(data.error?.message || 'Failed to assign provider')
      }
    } catch {
      setError('Network error')
    }
    setAssigning(false)
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          if (open) {
            setOpen(false)
          } else {
            openDropdown()
          }
        }}
        disabled={assigning}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer"
        style={{
          backgroundColor: 'var(--color-tertiaryContainer)',
          color: 'var(--color-onTertiaryContainer)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(0.9)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none'
        }}
      >
        {assigning ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <>
            Assign
            <ChevronDown size={12} />
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              setOpen(false)
            }}
          />
          <div
            style={{
              ...dropdownStyle,
              zIndex: 9999,
              backgroundColor: 'var(--color-surfaceContainerLowest)',
              border: '1px solid var(--color-outlineVariant)',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(13,16,33,0.12)',
            }}
            className="overflow-hidden"
          >
            <div
              className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-onSurfaceVariant)' }}
            >
              Select provider
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-onSurfaceVariant)' }} />
              </div>
            ) : providers.length === 0 ? (
              <p className="px-3 py-2 text-xs" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                No approved providers available
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      handleAssign(p.id, p.full_name)
                    }}
                    disabled={assigning}
                    className="w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    style={{ color: 'var(--color-onSurface)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surfaceContainerLow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserCheck size={14} style={{ color: 'var(--color-onSurfaceVariant)' }} />
                    {p.full_name}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="px-3 py-1.5 border-t" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                <p className="text-xs" style={{ color: 'var(--color-error, hsl(0, 65%, 45%))' }}>
                  {error}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
