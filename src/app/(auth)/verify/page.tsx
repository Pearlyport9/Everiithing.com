'use client'

import { useState, useRef, FormEvent, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || '080****5678'
  const maskedPhone = phone.length > 6 ? phone.slice(0, 3) + '****' + phone.slice(-4) : phone

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

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
      body: JSON.stringify({ phone, otp: code }),
    })
    const data = await res.json()

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Invalid code')
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
      <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">
        Verify your phone
      </h1>
      <p className="text-neutral-500 mb-6">
        Enter the 6-digit code sent to {maskedPhone}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          ))}
        </div>
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  )
}
