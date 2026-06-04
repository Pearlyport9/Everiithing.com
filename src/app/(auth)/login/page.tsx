'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()

    setLoading(false)

    if (!data.success) {
      setError(data.error?.message || 'Failed to send OTP')
      return
    }

    router.push(`/verify?phone=${encodeURIComponent(phone)}`)
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <h1 className="text-3xl font-display font-bold text-navy-900 mb-6">
        Welcome back
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            placeholder="080 1234 5678"
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-500 text-center">
        No account?{' '}
        <a href="/signup" className="text-accent-500 font-semibold">
          Sign up
        </a>
      </p>
    </div>
  )
}
