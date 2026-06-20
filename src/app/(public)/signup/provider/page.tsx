'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Check } from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  slug: string
}

export default function ProviderSignupPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [lgas, setLgas] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/service-categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setError('Full name, phone, and email are required.')
      return
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one service category.')
      return
    }

    setSaving(true)

    const res = await fetch('/api/providers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        category_ids: selectedCategories,
        service_lgas: lgas ? lgas.split(',').map((s) => s.trim()) : [],
        notes: notes.trim() || undefined,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!data.success) {
      setError(data.error?.message || 'Failed to submit application.')
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="pt-6 pb-24 md:pt-20 lg:pt-28 px-20">
        <div className="container-app max-w-lg text-center">
          <div className="bg-token-surface rounded-2xl p-8 md:p-12">
            <div className="w-16 h-16 rounded-full bg-token-primaryContainer text-token-onPrimaryContainer flex items-center justify-center mx-auto mb-6">
              <Check size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold text-token-onSurface mb-4">
              Application Received
            </h1>
            <p className="text-token-onSurfaceVariant mb-6">
              Thanks for applying to become a verified provider. Our team will review your
              application and reach out within 2–3 business days.
            </p>
            <a href="/" className="btn-primary inline-block">
              Back to Home
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-6 pb-24 md:pt-20 lg:pt-28 px-20">
      <div className="container-app max-w-lg">
        <div className="bg-token-surface rounded-2xl p-8 md:p-12">
          <p className="eyebrow mb-2 text-center">Join Our Team</p>
          <h1 className="text-3xl font-display font-bold text-token-onSurface mb-2 text-center">
            Become a Provider
          </h1>
          <p className="text-sm text-token-onSurfaceVariant text-center mb-8">
            Fill in your details and our team will review your application.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-token-onSurface mb-1.5">
                Full Name <span className="text-token-error">*</span>
              </label>
              <input
                type="text"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-token-onSurface mb-1.5">
                Phone <span className="text-token-error">*</span>
              </label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-token-onSurface mb-1.5">
                Email <span className="text-token-error">*</span>
              </label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-token-onSurface mb-2">
                Service Categories <span className="text-token-error">*</span>
              </label>
              {loading ? (
                <p className="text-sm text-token-onSurfaceVariant">Loading categories...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selected = selectedCategories.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                          selected
                            ? 'border-transparent text-white'
                            : 'text-token-onSurfaceVariant hover:border-token-primary'
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
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-token-onSurface mb-1.5">
                Service Areas / LGAs
              </label>
              <input
                type="text"
                className="input-field"
                value={lgas}
                onChange={(e) => setLgas(e.target.value)}
                placeholder="e.g. Ikeja, Surulere, VI"
              />
              <p className="text-xs text-token-onSurfaceVariant mt-1">Comma-separated list (optional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-token-onSurface mb-1.5">
                Notes
              </label>
              <textarea
                className="input-field"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything else we should know (optional)"
              />
            </div>

            {error && (
              <p className="text-sm text-token-error bg-red-50 px-3 py-2 rounded-md">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
