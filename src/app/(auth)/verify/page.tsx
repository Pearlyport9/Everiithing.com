'use client'

import { Suspense, useState, useRef, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const redirect = searchParams.get('redirect') || null
  const resetMode = searchParams.get('type') === 'password_reset'
  const maskedEmail = email.length > 3
    ? email.slice(0, 2) + '****' + email.slice(email.indexOf('@'))
    : email

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    inputRefs.current[0]?.focus()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCooldown = () => {
    setResendCooldown(60)
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code,
        type: resetMode ? 'password_reset' : 'signup',
      }),
    })
    const data = await res.json()

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Invalid code')
      return
    }

    if (resetMode) {
      router.push('/reset-password')
    } else {
      const supabase = createClient()
      if (data.data?.access_token && data.data?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.data.access_token,
          refresh_token: data.data.refresh_token,
        })
      }
      router.push(redirect || '/dashboard/book')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (data.success) {
      startCooldown()
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      setError(data.error?.message || 'Failed to resend code')
    }
  }

  return (
    <div className="bg-token-surface rounded-2xl p-8 w-full text-center">
      <h1 className="text-3xl font-display font-bold text-token-onPrimaryContainer mb-2">
        Verify your email
      </h1>
      <p className="text-token-onPrimaryContainer/70 mb-6">
        Enter the 6-digit code sent to {maskedEmail}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-12 text-center input-field text-xl"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-token-error">{error}</p>
        )}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading || otp.join('').length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div className="mt-6">
        {resendCooldown > 0 ? (
          <p className="text-sm text-token-onPrimaryContainer/60">
            Resend code in <span className="font-semibold text-token-primary">{resendCooldown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-token-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="bg-token-surface rounded-2xl p-8 w-full animate-pulse">
        <div className="h-8 w-48 bg-token-onPrimaryContainer/10 rounded mx-auto mb-2" />
        <div className="h-4 w-64 bg-token-onPrimaryContainer/10 rounded mx-auto mb-8" />
        <div className="flex gap-2 justify-center mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-12 h-12 bg-token-onPrimaryContainer/10 rounded-md" />
          ))}
        </div>
        <div className="h-12 bg-token-onPrimaryContainer/10 rounded-full w-full" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  )
}
