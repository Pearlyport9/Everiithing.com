'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Plus, Check, X, Search } from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  slug: string
}

interface ProviderCategory {
  category: ServiceCategory
}

interface Provider {
  id: string
  full_name: string
  phone: string
  email?: string
  notes?: string
  verification_status: string
  verified_at: string | null
  is_available: boolean
  service_lgas: string[] | null
  created_at: string
  provider_categories: ProviderCategory[]
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formCategories, setFormCategories] = useState<string[]>([])
  const [formLgas, setFormLgas] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formError, setFormError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = async () => {
    const [provRes, catRes] = await Promise.all([
      fetch('/api/admin/providers'),
      fetch('/api/service-categories'),
    ])
    const provData = await provRes.json()
    const catData = await catRes.json()
    if (provData.success) setProviders(provData.data)
    if (catData.success) setCategories(catData.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddProvider = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const res = await fetch('/api/admin/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: formName,
        phone: formPhone,
        email: formEmail || undefined,
        category_ids: formCategories,
        service_lgas: formLgas ? formLgas.split(',').map((s) => s.trim()) : [],
        notes: formNotes || undefined,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!data.success) {
      setFormError(data.error?.message || 'Failed to add provider')
      return
    }

    setFormName('')
    setFormPhone('')
    setFormEmail('')
    setFormCategories([])
    setFormLgas('')
    setFormNotes('')
    setShowForm(false)
    fetchData()
  }

  const handleVerify = async (providerId: string, status: string) => {
    const res = await fetch(`/api/admin/providers/${providerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verification_status: status }),
    })
    const data = await res.json()
    if (!data.success) {
      alert(data.error?.message || 'Failed to update provider')
      return
    }
    fetchData()
  }

  const toggleCategory = (catId: string) => {
    setFormCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    )
  }

  const filteredProviders = providers.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  })

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-[var(--color-tertiaryContainer)] text-[var(--color-onTertiaryContainer)]',
      approved: 'bg-[var(--color-primaryContainer)] text-[var(--color-onPrimaryContainer)]',
      rejected: 'bg-[var(--color-errorContainer)] text-[var(--color-onErrorContainer)]',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-[var(--color-surfaceVariant)] text-[var(--color-onSurfaceVariant)]'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)' }}>
        <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>Loading providers...</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)',
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            Providers
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Manage service providers on the platform
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-onPrimary)' }}
        >
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Add Provider'}
        </button>
      </div>

      {showForm && (
        <div
          className="rounded-2xl p-6 mb-8 shadow-sm"
          style={{
            backgroundColor: 'var(--color-surfaceContainerLow)',
          }}
        >
          <h2 className="font-display font-semibold text-lg mb-4" style={{ color: 'var(--color-onSurface)' }}>New Provider</h2>
          <form onSubmit={handleAddProvider} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-onSurface)' }}>Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                  style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-onSurface)' }}>Phone *</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                  style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-onSurface)' }}>Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                  style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-onSurface)' }}>Service Areas / LGAs</label>
                <input
                  type="text"
                  value={formLgas}
                  onChange={(e) => setFormLgas(e.target.value)}
                  placeholder="e.g. Ikeja, Surulere, VI"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                  style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-onSurface)' }}>Service Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const selected = formCategories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        selected
                          ? 'border-transparent text-white'
                          : 'text-[var(--color-onSurfaceVariant)] hover:border-[var(--color-primary)]'
                      }`}
                      style={{
                        backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
                        borderColor: selected ? 'transparent' : 'var(--color-outlineVariant)',
                      }}
                    >
                      {selected && <Check size={14} />}
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-onSurface)' }}>Notes</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-transparent"
                style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
              />
            </div>

            {formError && (
              <p className="text-sm px-3 py-2 rounded-md" style={{ color: 'var(--color-error)', backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, transparent)' }}>{formError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: 'var(--color-onSurfaceVariant)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 hover:brightness-110"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {saving ? 'Saving...' : 'Add Provider'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-onSurfaceVariant)' }} />
        <input
          type="text"
          placeholder="Search providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 pl-9 text-sm"
          style={{ backgroundColor: 'var(--color-surfaceVariant)', borderColor: 'var(--color-outline)', color: 'var(--color-onSurface)' }}
        />
      </div>

      {/* Mobile/tablet: card list */}
      <div className="lg:hidden space-y-3">
        {filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              {searchQuery ? 'No providers match your search.' : 'No providers yet. Add your first provider above.'}
            </p>
          </div>
        ) : (
          filteredProviders.map((provider) => {
            const initials = provider.full_name
              ? provider.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              : '?'
            const categories = provider.provider_categories?.map((pc) => pc.category?.name).join(', ') || ''
            return (
              <div
                key={provider.id}
                className="rounded-xl p-4 border"
                style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', borderColor: 'var(--color-outlineVariant)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-primaryContainer)' }}
                    >
                      <span className="text-xs font-bold" style={{ color: 'var(--color-onPrimaryContainer)' }}>
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-onSurface)' }}>
                        {provider.full_name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {statusBadge(provider.verification_status)}
                </div>

                {provider.email && (
                  <p className="text-xs mb-1.5" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                    {provider.email}
                  </p>
                )}

                <p className="text-xs" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                  {[provider.phone, categories, provider.service_lgas?.join(', ')].filter(Boolean).join(' \u00B7 ')}
                </p>

                <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                  {provider.verification_status !== 'approved' && (
                    <button
                      onClick={() => handleVerify(provider.id, 'approved')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-110"
                      style={{ color: 'var(--color-onPrimaryContainer)', backgroundColor: 'var(--color-primaryContainer)' }}
                    >
                      <Check size={14} />
                      Approve
                    </button>
                  )}
                  {provider.verification_status !== 'rejected' && (
                    <button
                      onClick={() => handleVerify(provider.id, 'rejected')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-110"
                      style={{ color: 'var(--color-onErrorContainer)', backgroundColor: 'var(--color-errorContainer)' }}
                    >
                      <X size={14} />
                      Reject
                    </button>
                  )}
                  {provider.verification_status === 'rejected' && (
                    <button
                      onClick={() => handleVerify(provider.id, 'pending')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-110"
                      style={{ color: 'var(--color-onTertiaryContainer)', backgroundColor: 'var(--color-tertiaryContainer)' }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden lg:block border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--color-outlineVariant)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--color-inverseSurface)',
                  color: 'var(--color-inverseOnSurface)',
                }}
              >
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Categories</th>
                <th className="px-4 py-3">LGAs</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-outlineVariant)' }}>
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="transition-colors hover:bg-[var(--color-surfaceContainerLow)]">
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: 'var(--color-onSurface)' }}>{provider.full_name || 'Unknown'}</div>
                    {provider.email && (
                      <div className="text-xs" style={{ color: 'var(--color-onSurfaceVariant)' }}>{provider.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>{provider.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {provider.provider_categories?.map((pc) => (
                        <span
                          key={pc.category?.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: 'var(--color-surfaceContainerLow)',
                            color: 'var(--color-onSurfaceVariant)',
                          }}
                        >
                          {pc.category?.name}
                        </span>
                      ))}
                      {(!provider.provider_categories || provider.provider_categories.length === 0) && (
                        <span style={{ color: 'var(--color-onSurfaceVariant)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                    {provider.service_lgas?.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(provider.verification_status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {provider.verification_status !== 'approved' && (
                        <button
                          onClick={() => handleVerify(provider.id, 'approved')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors" style={{ color: 'var(--color-onPrimaryContainer)', backgroundColor: 'var(--color-primaryContainer)' }}
                        >
                          <Check size={12} />
                          Verify
                        </button>
                      )}
                      {provider.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleVerify(provider.id, 'rejected')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors" style={{ color: 'var(--color-onErrorContainer)', backgroundColor: 'var(--color-errorContainer)' }}
                        >
                          <X size={12} />
                          Reject
                        </button>
                      )}
                      {provider.verification_status === 'rejected' && (
                        <button
                          onClick={() => handleVerify(provider.id, 'pending')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors" style={{ color: 'var(--color-onTertiaryContainer)', backgroundColor: 'var(--color-tertiaryContainer)' }}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                    {searchQuery ? 'No providers match your search.' : 'No providers yet. Add your first provider above.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
