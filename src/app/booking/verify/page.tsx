'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type VerifyState = 'loading' | 'confirmed' | 'pending' | 'failed' | 'cancelled'

interface BookingInfo {
  id: string
  service: string
  scheduled_date: string
  scheduled_time: string
  price_ngn: number
}

function BookingVerifyPage() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerifyState>('loading')
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const pollingRef = useRef(false)

  const transactionId = searchParams.get('transaction_id')
  const txRef = searchParams.get('tx_ref')
  const statusParam = searchParams.get('status')

  const verify = async () => {
    if (!transactionId || !txRef) {
      setState('failed')
      return
    }

    if (statusParam === 'cancelled') {
      setState('cancelled')
      return
    }

    const res = await fetch(`/api/booking/verify?transaction_id=${transactionId}&tx_ref=${txRef}&status=${statusParam || ''}`)
    const data = await res.json()

    if (!data.success) {
      setState('failed')
      return
    }

    const result = data.data

    if (result.status === 'confirmed') {
      setBooking(result.booking)
      setState('confirmed')
      return
    }

    if (result.status === 'failed' || result.status === 'cancelled') {
      setState(result.status)
      return
    }

    setBooking(result.booking)
    setState('pending')
  }

  useEffect(() => {
    verify()
  }, [transactionId, txRef, statusParam])

  useEffect(() => {
    if (state !== 'pending' || pollingRef.current) return
    pollingRef.current = true

    const interval = setInterval(async () => {
      if (pollCount >= 5) {
        clearInterval(interval)
        return
      }
      setPollCount((c) => c + 1)

      const res = await fetch(`/api/booking/verify?transaction_id=${transactionId}&tx_ref=${txRef}&status=${statusParam || ''}`)
      const data = await res.json()
      if (data.success && data.data?.status === 'confirmed') {
        setBooking(data.data.booking)
        setState('confirmed')
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [state, pollCount, transactionId, txRef, statusParam])

  const formatNaira = (n: number) => `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(n)}`

  const formatDateTime = (date: string, time: string) => {
    const d = new Date(date)
    return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`
  }

  if (state === 'loading') {
    return (
      <main className="section-padding">
        <div className="container-app max-w-lg mx-auto text-center">
          <div className="bg-token-surface rounded-2xl p-8 md:p-12">
            <div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            <p className="text-token-onSurfaceVariant">Verifying your payment...</p>
          </div>
        </div>
      </main>
    )
  }

  if (state === 'confirmed') {
    return (
      <main className="section-padding">
        <div className="container-app max-w-lg mx-auto">
          <div className="bg-token-surface rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-token-primaryContainer text-token-onPrimaryContainer flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-token-onSurface mb-2">
              Payment successful
            </h1>
            <p className="text-token-onSurfaceVariant mb-1">
              Your booking is confirmed.
            </p>
            <p className="text-sm text-token-onSurfaceVariant mb-6">
              Your provider will assess the job and send a quote for any remaining balance. Your call-out fee is held securely in escrow.
            </p>

            {booking && (
              <div className="bg-token-surfaceContainerLow rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-token-onSurfaceVariant">Service</span>
                  <span className="font-medium text-token-onSurface">{booking.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-token-onSurfaceVariant">Date & Time</span>
                  <span className="font-medium text-token-onSurface">{formatDateTime(booking.scheduled_date, booking.scheduled_time)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                  <span className="text-token-onSurfaceVariant">Call-out fee paid</span>
                  <span className="font-mono font-semibold text-token-onSurface">{formatNaira(booking.price_ngn)}</span>
                </div>
              </div>
            )}

            <Link href="/dashboard/bookings" className="btn-primary inline-block">
              View my bookings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (state === 'pending') {
    return (
      <main className="section-padding">
        <div className="container-app max-w-lg mx-auto text-center">
          <div className="bg-token-surface rounded-2xl p-8 md:p-12">
            <div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            <h1 className="text-2xl font-display font-bold text-token-onSurface mb-2">
              Payment received
            </h1>
            <p className="text-token-onSurfaceVariant mb-1">
              Confirming your booking...
            </p>
            <p className="text-sm text-token-onSurfaceVariant mb-6">
              {pollCount >= 5
                ? 'This is taking longer than usual. You\'ll receive a confirmation email shortly.'
                : 'Please wait while we process your payment.'}
            </p>

            {booking && (
              <div className="bg-token-surfaceContainerLow rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-token-onSurfaceVariant">Service</span>
                  <span className="font-medium text-token-onSurface">{booking.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-token-onSurfaceVariant">Date & Time</span>
                  <span className="font-medium text-token-onSurface">{formatDateTime(booking.scheduled_date, booking.scheduled_time)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                  <span className="text-token-onSurfaceVariant">Call-out fee paid</span>
                  <span className="font-mono font-semibold text-token-onSurface">{formatNaira(booking.price_ngn)}</span>
                </div>
              </div>
            )}

            <Link href="/dashboard/bookings" className="btn-primary inline-block">
              View my bookings
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="section-padding">
      <div className="container-app max-w-lg mx-auto text-center">
        <div className="bg-token-surface rounded-2xl p-8 md:p-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--color-errorContainer)', color: 'var(--color-onErrorContainer)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-token-onSurface mb-2">
            {state === 'cancelled' ? 'Payment cancelled' : 'Payment could not be confirmed'}
          </h1>
          <p className="text-token-onSurfaceVariant mb-1">
            {state === 'cancelled'
              ? 'You cancelled the payment. No money has been charged.'
              : 'We were unable to verify your payment. No money has been charged.'}
          </p>
          <p className="text-sm text-token-onSurfaceVariant mb-6">
            If you believe this is an error, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard/book" className="btn-primary">
              Try again
            </Link>
            <a href="mailto:support@everiithing.com" className="btn-secondary">
              Contact support
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <main className="section-padding">
        <div className="container-app max-w-lg mx-auto text-center">
          <div className="bg-token-surface rounded-2xl p-8 md:p-12">
            <div className="w-12 h-12 rounded-full border-2 mx-auto mb-5 animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            <p className="text-token-onSurfaceVariant">Verifying your payment...</p>
          </div>
        </div>
      </main>
    }>
      <BookingVerifyPage />
    </Suspense>
  )
}
