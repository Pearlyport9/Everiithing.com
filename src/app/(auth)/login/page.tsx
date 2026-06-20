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

export default function LoginPage() {
  const router = useRouter()
  const redirect = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('redirect')
    : null
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!identifier.trim()) errors.identifier = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) errors.identifier = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    return errors
  }, [identifier, password])

  const isValid = Object.keys(fieldErrors).length === 0

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ identifier: true, password: true })
    if (!isValid) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password }),
    })
    const data = await res.json()

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Invalid email or password')
      return
    }

    const supabase = createClient()
    await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = profile?.role
      const redirectTo = redirect || (role === 'admin' ? '/admin' : role === 'provider' ? '/provider' : '/dashboard')
      router.push(redirectTo)
    } else {
      router.push(redirect || '/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
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

  const isIdentifierValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())

  const inputClass = (field: string) => {
    const showError = touched[field] && fieldErrors[field]
    const showSuccess = field === 'identifier' && touched.identifier && !fieldErrors.identifier && isIdentifierValid
    return `input-field ${showError ? 'border-token-error' : showSuccess ? 'border-token-primary' : ''}`
  }

  return (
    <div className="bg-token-surface rounded-2xl p-8 md:p-12 w-full">
      <h1 className="text-3xl font-display font-bold text-token-onSurface mb-8 text-center">
        Welcome back
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="block text-sm font-medium text-token-onSurface mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            className={inputClass('identifier')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onBlur={() => handleBlur('identifier')}
            onFocus={() => setError('')}
            required
          />
          {identifier && fieldErrors.identifier && (
            <p className="text-xs text-token-error mt-1">{fieldErrors.identifier}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-token-onSurface">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-token-primary font-medium hover:underline"
            >
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass('password')} pr-10`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              onFocus={() => setError('')}
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

        {error && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[520px] px-6 md:px-8">
            <p className="bg-token-error text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg text-center">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-token-outline" />
          <span className="text-xs font-medium text-token-onSurfaceVariant uppercase tracking-wider whitespace-nowrap">or continue with</span>
          <div className="flex-1 h-px bg-token-outline" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-token-outline bg-white text-token-onSurface font-medium text-sm hover:bg-gray-50 transition-colors duration-fast disabled:opacity-50"
        >
          <GoogleIcon size={20} />
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </form>

      <p className="mt-6 text-sm text-token-onSurfaceVariant text-center">
        No account?{' '}
        <a href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'} className="text-token-primary font-semibold hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  )
}

