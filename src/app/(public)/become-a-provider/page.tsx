'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

interface ServiceCategory {
  id: string
  name: string
  slug: string
}

const providerImages = [
  { src: '/images/everiithing/PIC%205%20SVG.svg', alt: 'Painting professional at work' },
  { src: '/images/everiithing/PIC%206%20SVG.svg', alt: 'Generator technician on site' },
  { src: '/images/everiithing/PIC%207%20SVG.svg', alt: 'Carpentry professional working' },
]

const NIGERIAN_PHONE = /^(\+?234)?[0-9]{10}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizePhone(val: string): string {
  let v = val.replace(/[\s\-()]/g, '')
  if (v.startsWith('234')) v = '+' + v
  else if (v.startsWith('0')) v = '+234' + v.slice(1)
  return v
}

function stripPrefix(val: string): string {
  let v = val.replace(/[\s\-()]/g, '')
  if (v.startsWith('+234')) v = v.slice(4)
  else if (v.startsWith('234')) v = v.slice(3)
  else if (v.startsWith('0')) v = v.slice(1)
  return v
}

export default function BecomeProviderPage() {
  const [reducedMotion, setReducedMotion] = useState(false)

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [summaryError, setSummaryError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const fullNameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    fetch('/api/service-categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data)
        setLoadingCats(false)
      })
      .catch(() => setLoadingCats(false))
  }, [])

  const clearError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    setSummaryError('')
  }

  const validateFullName = (val: string): string | null => {
    if (!val.trim()) return 'Please enter your full name'
    return null
  }

  const validatePhone = (val: string): string | null => {
    if (!val.trim()) return 'Please enter a valid Nigerian phone number'
    const stripped = stripPrefix(val)
    if (!NIGERIAN_PHONE.test(normalizePhone(val)) && !/^[0-9]{10}$/.test(stripped)) {
      return 'Please enter a valid Nigerian phone number'
    }
    return null
  }

  const validateEmail = (val: string): string | null => {
    if (!val.trim()) return 'Please enter a valid email address'
    if (!EMAIL_REGEX.test(val.trim())) return 'Please enter a valid email address'
    return null
  }

  const validateNotes = (val: string): string | null => {
    if (!val.trim()) return 'Please tell us a little about yourself'
    if (val.trim().length < 50) return 'Please tell us a bit more — minimum 50 characters'
    return null
  }

  const validateCategory = (): string | null => {
    if (!selectedCategory) return 'Please select a service category'
    return null
  }

  const handleBlurFullName = () => {
    const err = validateFullName(fullName)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.fullName = err
      else delete next.fullName
      return next
    })
  }

  const handleBlurPhone = () => {
    const err = validatePhone(phone)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.phone = err
      else delete next.phone
      return next
    })
  }

  const handleBlurEmail = () => {
    const err = validateEmail(email)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.email = err
      else delete next.email
      return next
    })
  }

  const handleBlurNotes = () => {
    const err = validateNotes(notes)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.notes = err
      else delete next.notes
      return next
    })
  }

  const toggleCategory = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory('')
    } else {
      setSelectedCategory(catId)
    }
    clearError('categories')
  }

  const scrollToEl = (el: HTMLElement | null) => {
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const validateAll = (): boolean => {
    const errs: Record<string, string> = {}
    const fnErr = validateFullName(fullName)
    if (fnErr) errs.fullName = fnErr
    const phErr = validatePhone(phone)
    if (phErr) errs.phone = phErr
    const emErr = validateEmail(email)
    if (emErr) errs.email = emErr
    const catErr = validateCategory()
    if (catErr) errs.categories = catErr
    const ntErr = validateNotes(notes)
    if (ntErr) errs.notes = ntErr

    setFieldErrors(errs)
    setSummaryError(Object.keys(errs).length > 0 ? 'Please fill in all required fields before submitting.' : '')

    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateAll()) {
      const firstKey = Object.keys(fieldErrors).length > 0 ? Object.keys(fieldErrors)[0] : null
      if (firstKey === 'fullName' || !fullName.trim()) scrollToEl(fullNameRef.current)
      else if (firstKey === 'phone' || !phone.trim()) scrollToEl(phoneRef.current)
      else if (firstKey === 'email' || !email.trim()) scrollToEl(emailRef.current)
      else if (firstKey === 'notes' || !notes.trim() || notes.trim().length < 50) scrollToEl(notesRef.current)
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
        category_ids: selectedCategory ? [selectedCategory] : [],
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

  const charCount = notes.length
  const charCounterColor =
    charCount >= 450
      ? 'var(--color-error)'
      : 'var(--color-inverseOnSurface)'

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: 'var(--md-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-16 max-md:pb-12 md:pt-20 lg:pt-28 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* ─── Left Column ─── */}
            <div
              className="space-y-6 max-md:space-y-4"
              style={{
                opacity: 1,
                transform: 'none',
                transition: 'opacity 450ms ease-out, transform 450ms ease-out',
              }}
            >
              <h1
                className="text-4xl sm:text-5xl font-display font-extrabold leading-[1.1] max-md:leading-[1.0]"
                style={{ color: 'var(--color-onSurface)' }}
              >
                Become a<br />Verified Provider
              </h1>

              <p
                className="text-base md:text-lg leading-relaxed max-w-[480px]"
                style={{ color: 'var(--color-onSurfaceVariant)' }}
              >
                Join Lagos&apos;s most trusted home and office services marketplace. We only work with
                skilled, professional tradespeople who take quality seriously. Apply below
                and our team will review your application within 48 hours.
              </p>

              {/* 3 Images */}
              <div className="flex gap-3">
                {providerImages.map((img) => (
                  <div
                    key={img.src}
                    className="flex-1 rounded-xl overflow-hidden relative"
                    style={{ height: '180px' }}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Right Column — Form Card ─── */}
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{
                backgroundColor: 'var(--color-inverseSurface)',
                opacity: 1,
                transform: 'none',
                transition: 'opacity 450ms ease-out 75ms, transform 450ms ease-out 75ms',
              }}
            >
              <h2
                className="text-2xl font-display font-bold mb-1"
                style={{ color: 'var(--color-inverseOnSurface)' }}
              >
                Apply to Join
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--color-inverseOnSurface)', opacity: 0.7 }}
              >
                Fill in your details and our team will review your application.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Full Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-inverseOnSurface)' }}
                  >
                    Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    ref={fullNameRef}
                    type="text"
                    disabled={submitted}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-surfaceContainerLowest)',
                      color: 'var(--color-onSurface)',
                      border: fieldErrors.fullName
                        ? '1px solid var(--color-error)'
                        : '1px solid transparent',
                      boxShadow: fieldErrors.fullName
                        ? '0 0 0 2px var(--color-error)'
                        : 'none',
                    }}
                    value={fullName}
                    onBlur={handleBlurFullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      clearError('fullName')
                    }}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-inverseOnSurface)' }}
                  >
                    Phone Number <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    ref={phoneRef}
                    type="tel"
                    disabled={submitted}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-surfaceContainerLowest)',
                      color: 'var(--color-onSurface)',
                      border: fieldErrors.phone
                        ? '1px solid var(--color-error)'
                        : '1px solid transparent',
                      boxShadow: fieldErrors.phone
                        ? '0 0 0 2px var(--color-error)'
                        : 'none',
                    }}
                    placeholder="+234..."
                    value={phone}
                    onBlur={handleBlurPhone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      clearError('phone')
                    }}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-inverseOnSurface)' }}
                  >
                    Email Address <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    ref={emailRef}
                    type="email"
                    disabled={submitted}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-surfaceContainerLowest)',
                      color: 'var(--color-onSurface)',
                      border: fieldErrors.email
                        ? '1px solid var(--color-error)'
                        : '1px solid transparent',
                      boxShadow: fieldErrors.email
                        ? '0 0 0 2px var(--color-error)'
                        : 'none',
                    }}
                    value={email}
                    onBlur={handleBlurEmail}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      clearError('email')
                    }}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Service Category */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-inverseOnSurface)' }}
                  >
                    Service Category <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  {loadingCats ? (
                    <p className="text-sm" style={{ color: 'var(--color-inverseOnSurface)', opacity: 0.6 }}>
                      Loading categories...
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const selected = selectedCategory === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            disabled={submitted}
                            onClick={() => { if (!submitted) toggleCategory(cat.id) }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: selected
                                ? 'var(--color-primary)'
                                : 'transparent',
                              borderColor: selected
                                ? 'transparent'
                                : 'rgba(255,255,255,0.2)',
                              color: selected
                                ? 'var(--color-onPrimary)'
                                : 'var(--color-inverseOnSurface)',
                            }}
                          >
                            {selected && <Check size={14} />}
                            {cat.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {fieldErrors.categories && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                      {fieldErrors.categories}
                    </p>
                  )}
                </div>

                {/* Tell us about yourself */}
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-inverseOnSurface)' }}
                  >
                    Tell us about yourself <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <textarea
                    ref={notesRef}
                    disabled={submitted}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 resize-none font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--color-surfaceContainerLowest)',
                      color: 'var(--color-onSurface)',
                      border: fieldErrors.notes
                        ? '1px solid var(--color-error)'
                        : '1px solid transparent',
                      boxShadow: fieldErrors.notes
                        ? '0 0 0 2px var(--color-error)'
                        : 'none',
                    }}
                    rows={4}
                    maxLength={500}
                    value={notes}
                    onBlur={handleBlurNotes}
                    onChange={(e) => {
                      setNotes(e.target.value)
                      clearError('notes')
                    }}
                    placeholder="Share your experience, skills, or anything else we should know"
                  />
                  <div
                    className="flex justify-between items-center mt-1"
                    style={{ color: charCounterColor }}
                  >
                    <span>
                      {fieldErrors.notes && (
                        <span className="text-xs" style={{ color: 'var(--color-error)' }}>
                          {fieldErrors.notes}
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-body">{charCount} / 500</span>
                  </div>
                </div>

                {/* Summary error */}
                {summaryError && (
                  <p
                    className="text-sm px-3 py-2 rounded-md font-body"
                    style={{
                      color: 'var(--color-error)',
                      backgroundColor: 'var(--color-errorContainer)',
                    }}
                  >
                    {summaryError}
                  </p>
                )}

                {/* Global error */}
                {error && (
                  <p
                    className="text-sm px-3 py-2 rounded-md font-body"
                    style={{
                      color: 'var(--color-error)',
                      backgroundColor: 'var(--color-errorContainer)',
                    }}
                  >
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving || submitted}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  style={{
                    backgroundColor: 'var(--color-tertiary)',
                    color: 'var(--color-onTertiary)',
                  }}
                >
                  {saving ? 'Submitting...' : submitted ? 'Submitted' : 'Submit Application'}
                </button>

                {/* Success message */}
                {submitted && (
                  <div
                    className="flex items-center gap-3 rounded-xl p-4"
                    style={{ backgroundColor: 'var(--color-primaryContainer)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Check size={18} style={{ color: 'var(--color-onPrimary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-onPrimaryContainer)' }}>
                        Application Submitted!
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-onPrimaryContainer)', opacity: 0.8 }}>
                        We&apos;ll review your details and get back to you within 48 hours.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
      </div>

      {/* ─── CTA Banner ─── */}
      <section className="relative pt-14 pb-16 md:py-20 flex items-center justify-center overflow-hidden bg-[var(--md-primary)]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/images/everiithing/cta-bg.png)' }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--md-on-background)', opacity: 0.78 }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold text-white leading-tight">
            Stop Gambling with Your Home or Office
          </h2>
          <p className="text-white/80 text-sm md:text-base mt-2 mx-auto" style={{ maxWidth: '480px' }}>
            <span className="md:hidden">Verified pros, zero stress.</span>
            <span className="hidden md:inline">Verified pros, transparent pricing, guaranteed results, zero stress.</span>
          </p>
          <div className="flex flex-col items-center gap-3 mt-6 max-w-xs mx-auto">
            <Link
              href="/dashboard/book"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
            >
              Book a Service <ArrowRight size={18} />
            </Link>
            <Link
              href="/become-a-provider"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-2 border-white"
              style={{ color: 'white', backgroundColor: 'transparent' }}
            >
              Join as a Provider
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
