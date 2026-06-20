'use client'

import { useState, FormEvent, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const redirect = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('redirect')
    : null
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters'
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    return errors
  }, [fullName, email, password])

  const passwordReqs = useMemo(() => {
    if (!password) return []
    const unmet: string[] = []
    if (password.length < 8) unmet.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) unmet.push('One uppercase letter')
    if (!/[a-z]/.test(password)) unmet.push('One lowercase letter')
    if (!/[0-9]/.test(password)) unmet.push('One number')
    if (!/[^a-zA-Z0-9]/.test(password)) unmet.push('One special character')
    return unmet
  }, [password])

  const isValid = Object.keys(fieldErrors).length === 0 && passwordReqs.length === 0

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ fullName: true, email: true, password: true })
    if (!isValid) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, phone, email, password }),
    })
    const data = await res.json()
    console.log('Signup response status:', res.status)
    console.log('Signup response body:', data)
    if (!res.ok) {
      console.error('Signup failed:', data)
    }

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Failed to create account')
      return
    }

    const params = new URLSearchParams({ email })
    if (redirect) params.set('redirect', redirect)
    router.push(`/verify?${params.toString()}`)
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  const isFieldValid = (field: string) => {
    if (field === 'fullName') return fullName.trim().length >= 2
    if (field === 'phone') return /^0\d{10}$/.test(phone.replace(/\s/g, ''))
    if (field === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return false
  }

  const inputClass = (field: string) => {
    const showError = touched[field] && fieldErrors[field]
    const showSuccess = touched[field] && !fieldErrors[field] && isFieldValid(field)
    const filled = field === 'fullName' && showSuccess
    return `input-field ${showError ? 'border-token-error' : showSuccess ? 'border-token-primary' : ''} ${filled ? 'bg-token-surfaceContainerLow' : ''}`
  }

  return (
    <div className="bg-token-surface rounded-2xl p-8 md:p-12 w-full">
      <h1 className="text-3xl font-display font-bold text-token-onSurface mb-8 text-center">
        Create an account
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-token-onSurface mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            className={inputClass('fullName')}
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => handleBlur('fullName')}
            required
          />
          {((touched.fullName && fieldErrors.fullName) || (fullName && fullName.trim().length < 2)) && (
            <p className="text-xs text-token-error mt-1">Name must be at least 2 characters</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-token-onSurface mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            className={inputClass('phone')}
           
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => handleBlur('phone')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-token-onSurface mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            className={inputClass('email')}
           
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            required
          />
          {email && fieldErrors.email && (
            <p className="text-xs text-token-error mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-token-onSurface mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass('password')} pr-10`}
             
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => { handleBlur('password'); setError('') }}
              required
            />
            {password && passwordReqs.length > 0 && (
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
          {password && passwordReqs.length > 0 && (
            <ul className="mt-2 space-y-1">
              {passwordReqs.map((req) => (
                <li key={req} className="text-xs text-token-error flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-token-error shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-sm text-token-error bg-red-50 px-3 py-2 rounded-md">{error}</p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-token-outline" />
          <span className="text-xs font-medium text-token-onSurfaceVariant uppercase tracking-wider whitespace-nowrap">or continue with</span>
          <div className="flex-1 h-px bg-token-outline" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-token-outline bg-white text-token-onSurface font-medium text-sm hover:bg-gray-50 transition-colors duration-fast disabled:opacity-50"
        >
          <GoogleIcon size={20} />
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </form>

      <p className="mt-6 text-sm text-token-onSurfaceVariant text-center">
        Already have an account?{' '}
        <a href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="text-token-primary font-semibold hover:underline">
          Sign In
        </a>
      </p>
    </div>
  )
}

