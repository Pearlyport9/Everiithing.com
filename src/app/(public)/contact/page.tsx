'use client'

import { useState, useRef, FormEvent } from 'react'
import { Check } from 'lucide-react'

const trustPoints = [
  'We respond within 24 hours',
  'Your message goes directly to our team',
  'No bots, real people',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [summaryError, setSummaryError] = useState('')

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const clearError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
    setSummaryError('')
  }

  const validateName = (val: string): string | null => {
    if (!val.trim()) return 'Please enter your full name'
    return null
  }

  const validateEmail = (val: string): string | null => {
    if (!val.trim()) return 'Please enter a valid email address'
    if (!EMAIL_REGEX.test(val.trim())) return 'Please enter a valid email address'
    return null
  }

  const validateSubject = (val: string): string | null => {
    if (!val.trim()) return 'Please enter a subject'
    return null
  }

  const validateMessage = (val: string): string | null => {
    if (!val.trim()) return 'Please enter a message'
    return null
  }

  const handleBlurName = () => {
    const err = validateName(name)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.name = err
      else delete next.name
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

  const handleBlurSubject = () => {
    const err = validateSubject(subject)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.subject = err
      else delete next.subject
      return next
    })
  }

  const handleBlurMessage = () => {
    const err = validateMessage(message)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (err) next.message = err
      else delete next.message
      return next
    })
  }

  const scrollToEl = (el: HTMLElement | null) => {
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const validateAll = (): boolean => {
    const errs: Record<string, string> = {}
    const nameErr = validateName(name)
    if (nameErr) errs.name = nameErr
    const emailErr = validateEmail(email)
    if (emailErr) errs.email = emailErr
    const subjectErr = validateSubject(subject)
    if (subjectErr) errs.subject = subjectErr
    const messageErr = validateMessage(message)
    if (messageErr) errs.message = messageErr

    setFieldErrors(errs)
    setSummaryError(Object.keys(errs).length > 0 ? 'Please fill in all required fields before submitting.' : '')

    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateAll()) {
      const firstKey = Object.keys(fieldErrors).length > 0 ? Object.keys(fieldErrors)[0] : null
      if (firstKey === 'name' || !name.trim()) scrollToEl(nameRef.current)
      else if (firstKey === 'email' || !email.trim()) scrollToEl(emailRef.current)
      else if (firstKey === 'subject' || !subject.trim()) scrollToEl(subjectRef.current)
      else if (firstKey === 'message' || !message.trim()) scrollToEl(messageRef.current)
      return
    }

    setSending(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const inputStyle = (field: string) => ({
    backgroundColor: 'var(--color-surfaceContainerLowest)',
    color: 'var(--color-onSurface)',
    border: fieldErrors[field]
      ? '1px solid var(--color-error)'
      : '1px solid transparent',
    boxShadow: fieldErrors[field]
      ? '0 0 0 2px var(--color-error)'
      : 'none',
  })

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--md-surface)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 pb-16 max-md:pb-12 md:pt-20 lg:pt-28 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-6 max-md:space-y-4">
            <h1
              className="text-4xl sm:text-5xl font-display font-extrabold leading-[1.1] max-md:leading-[1.0]"
              style={{ color: 'var(--color-onSurface)' }}
            >
              Get in Touch
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed max-w-[480px]"
              style={{ color: 'var(--color-onSurfaceVariant)' }}
            >
              Have a question or need help? Send us a message and we&apos;ll get back
              to you within 24 hours.
            </p>

            <div className="space-y-3 pt-2">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--color-primaryContainer)' }}
                  >
                    <Check size={14} style={{ color: 'var(--color-onPrimaryContainer)' }} />
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-onSurfaceVariant)' }}
                  >
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-6 md:p-8"
            style={{ backgroundColor: 'var(--color-inverseSurface)' }}
          >
            <h2
              className="text-2xl font-display font-bold mb-1"
              style={{ color: 'var(--color-inverseOnSurface)' }}
            >
              Send a Message
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--color-inverseOnSurface)', opacity: 0.7 }}
            >
              Fill in the form and we&apos;ll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--color-inverseOnSurface)' }}
                >
                  Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  disabled={sending || success}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                  style={inputStyle('name')}
                  value={name}
                  onBlur={handleBlurName}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearError('name')
                  }}
                />
                {fieldErrors.name && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                    {fieldErrors.name}
                  </p>
                )}
              </div>

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
                  disabled={sending || success}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                  style={inputStyle('email')}
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

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--color-inverseOnSurface)' }}
                >
                  Subject <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  ref={subjectRef}
                  type="text"
                  disabled={sending || success}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body disabled:opacity-50 disabled:cursor-not-allowed"
                  style={inputStyle('subject')}
                  value={subject}
                  onBlur={handleBlurSubject}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    clearError('subject')
                  }}
                />
                {fieldErrors.subject && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                    {fieldErrors.subject}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--color-inverseOnSurface)' }}
                >
                  Message <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <textarea
                  ref={messageRef}
                  disabled={sending || success}
                  rows={5}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 font-body resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={inputStyle('message')}
                  value={message}
                  onBlur={handleBlurMessage}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    clearError('message')
                  }}
                />
                <p
                  className="text-xs mt-1 text-right"
                  style={{ color: 'var(--color-inverseOnSurface)', opacity: 0.5 }}
                >
                  {message.length}/500
                </p>
                {fieldErrors.message && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
                    {fieldErrors.message}
                  </p>
                )}
              </div>

              {success && (
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
                      Message Sent!
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-onPrimaryContainer)', opacity: 0.8 }}>
                      We&apos;ll be in touch within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {!success && (
                <>
                  {summaryError && (
                    <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                      {summaryError}
                    </p>
                  )}

                  {error && (
                    <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending || success}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    style={{
                      backgroundColor: 'var(--color-tertiary)',
                      color: 'var(--color-onTertiary)',
                    }}
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
