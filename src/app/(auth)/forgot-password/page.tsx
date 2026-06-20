'use client'

import { useState, FormEvent, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const emailError = useMemo(() => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address'
    return ''
  }, [email])

  const isValid = !emailError

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Failed to send reset code')
      return
    }

    router.push(`/verify?email=${encodeURIComponent(email)}&type=password_reset`)
  }

  return (
    <div className="bg-token-surface rounded-2xl p-8 w-full">
      <h1 className="text-3xl font-display font-bold text-token-onPrimaryContainer mb-6">
        Forgot Password
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-token-onPrimaryContainer mb-1">
            Email Address
          </label>
          <input
            type="email"
            className={`input-field ${touched && emailError ? 'border-token-error' : ''}`}
           
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            required
          />
          {touched && emailError && (
            <p className="text-xs text-token-error mt-1">{emailError}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-token-error">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading || !isValid}>
          {loading ? 'Sending...' : 'Send Reset Code'}
        </button>
      </form>
      <p className="mt-4 text-sm text-token-onPrimaryContainer/70 text-center">
        Remember your password?{' '}
        <a href="/login" className="text-token-primary font-semibold">
          Sign In
        </a>
      </p>
    </div>
  )
}

