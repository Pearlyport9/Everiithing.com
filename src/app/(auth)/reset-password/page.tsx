'use client'

import { useState, FormEvent, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setChecking(false)
    })
  }, [router])

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!password) errors.password = 'Password is required'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
    return errors
  }, [password, confirmPassword])

  const isValid = Object.keys(fieldErrors).length === 0

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ password: true, confirmPassword: true })
    if (!isValid) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Failed to reset password')
      return
    }

    router.push('/login')
  }

  const inputClass = (field: string) =>
    `input-field ${touched[field] && fieldErrors[field] ? 'border-token-error' : ''}`

  if (checking) {
    return (
      <div className="bg-token-surface rounded-2xl p-8 w-full animate-pulse">
        <div className="h-8 w-48 bg-token-onPrimaryContainer/10 rounded mb-2" />
        <div className="h-4 w-64 bg-token-onPrimaryContainer/10 rounded mb-8" />
        <div className="h-10 bg-token-onPrimaryContainer/10 rounded mb-4" />
        <div className="h-10 bg-token-onPrimaryContainer/10 rounded mb-4" />
        <div className="h-12 bg-token-onPrimaryContainer/10 rounded-full w-full" />
      </div>
    )
  }

  return (
    <div className="bg-token-surface rounded-2xl p-8 w-full">
      <h1 className="text-3xl font-display font-bold text-token-onPrimaryContainer mb-6">
        Set new password
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-token-onPrimaryContainer mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass('password')} pr-10`}
             
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              minLength={6}
              required
            />
            {password && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-token-onSurfaceVariant hover:text-token-onSurface bg-transparent border-none p-0 cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            )}
          </div>
          {touched.password && fieldErrors.password && (
            <p className="text-xs text-token-error mt-1">{fieldErrors.password}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-token-onPrimaryContainer mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              className={`${inputClass('confirmPassword')} pr-10`}
             
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              minLength={6}
              required
            />
            {confirmPassword && (
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-token-onSurfaceVariant hover:text-token-onSurface bg-transparent border-none p-0 cursor-pointer"
              tabIndex={-1}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            )}
          </div>
          {touched.confirmPassword && fieldErrors.confirmPassword && (
            <p className="text-xs text-token-error mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-token-error">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading || !isValid}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}
