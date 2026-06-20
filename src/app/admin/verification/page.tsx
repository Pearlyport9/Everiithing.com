'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, Check, X } from 'lucide-react'

interface ProviderCategory {
  category: { id: string; name: string }
}

interface PendingProvider {
  id: string
  full_name: string
  phone: string
  email?: string
  service_lgas: string[] | null
  notes?: string
  verification_status: string
  created_at: string
  provider_categories: ProviderCategory[]
}

export default function VerificationPage() {
  const [providers, setProviders] = useState<PendingProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState<string | null>(null)

  const fetchPending = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/providers')
    const data = await res.json()
    if (data.success) {
      setProviders(data.data.filter((p: PendingProvider) => p.verification_status === 'pending'))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleAction = async (providerId: string, status: string) => {
    setActingId(providerId)
    const res = await fetch(`/api/admin/providers/${providerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_status: status }),
    })
    const data = await res.json()
    if (!data.success) {
      alert(data.error?.message || 'Failed to update provider')
      setActingId(null)
      return
    }
    setActingId(null)
    fetchPending()
  }

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 4px 24px rgba(13, 16, 33, 0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            Provider Verification
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Review and verify provider applications
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>Loading...</p>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 md:py-16">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--color-primaryContainer)' }}
          >
            <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p className="font-display font-semibold text-lg" style={{ color: 'var(--color-onSurface)' }}>
            No providers pending verification
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Provider applications awaiting review will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: 'var(--color-surfaceContainerLow)',
                borderColor: 'var(--color-outlineVariant)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold text-base" style={{ color: 'var(--color-onSurface)' }}>
                    {provider.full_name}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                    {provider.phone}{provider.email ? ` · ${provider.email}` : ''}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--color-tertiaryContainer)', color: 'var(--color-onTertiaryContainer)' }}>
                  pending
                </span>
              </div>

              {provider.provider_categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {provider.provider_categories.map((pc) => (
                    <span
                      key={pc.category.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: 'var(--color-surfaceContainer)',
                        color: 'var(--color-onSurfaceVariant)',
                      }}
                    >
                      {pc.category.name}
                    </span>
                  ))}
                </div>
              )}

              {provider.service_lgas && provider.service_lgas.length > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                  Service areas: {provider.service_lgas.join(', ')}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                <button
                  onClick={() => handleAction(provider.id, 'approved')}
                  disabled={actingId === provider.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Check size={15} />
                  {actingId === provider.id ? 'Approve...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction(provider.id, 'rejected')}
                  disabled={actingId === provider.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border"
                  style={{
                    color: 'var(--color-onSurface)',
                    borderColor: 'var(--color-outline)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <X size={15} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
