'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Loader2, CheckCircle, XCircle, ExternalLink, FileDown } from 'lucide-react'
import type { Booking } from '@/types'
import { useFlutterwaveCheckout } from '@/lib/flutterwave/useFlutterwaveCheckout'

type BookingDetail = Pick<Booking,
  | 'id' | 'scheduled_date' | 'scheduled_time' | 'price_ngn'
  | 'status' | 'payment_status' | 'notes' | 'address' | 'lga'
  | 'created_at' | 'provider_id'
  | 'quoted_total_ngn' | 'topup_owed_ngn' | 'quote_notes'
> & {
  provider?: { full_name?: string } | null
  service?: { name?: string } | null
}

interface BookingDetailModalProps {
  bookingId: string | null
  onClose: () => void
}

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function BookingDetailModal({ bookingId, onClose }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [paymentPending, setPaymentPending] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { sdkLoaded, openCheckout } = useFlutterwaveCheckout()
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    setError('')
    setPaymentPending(false)

    async function load() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError('Not authenticated'); setLoading(false); return }

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select(`
            id,
            scheduled_date,
            scheduled_time,
            price_ngn,
            status,
            payment_status,
            notes,
            address,
            lga,
            created_at,
            provider_id,
            quoted_total_ngn,
            topup_owed_ngn,
            quote_notes,
            provider:provider_id (full_name),
            service:service_id (name)
          `)
          .eq('id', bookingId)
          .eq('customer_id', user.id)
          .single()

        if (fetchError || !data) {
          setError('Could not load booking details.')
          setLoading(false)
          return
        }

        setBooking(data as unknown as BookingDetail)
      } catch {
        setError('Something went wrong.')
      }
      setLoading(false)
    }

    load()
  }, [bookingId])

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [])

  const serviceName = booking?.service
    ? (Array.isArray(booking.service) ? booking.service[0]?.name : booking.service.name)
    : null

  const providerName = booking?.provider
    ? (Array.isArray(booking.provider) ? booking.provider[0]?.full_name : booking.provider.full_name)
    : null

  const refetchBooking = useCallback(async () => {
    if (!bookingId) return
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('bookings')
        .select(`
          id, scheduled_date, scheduled_time, price_ngn, status,
          payment_status, notes, address, lga, created_at, provider_id,
          quoted_total_ngn, topup_owed_ngn, quote_notes,
          provider:provider_id (full_name),
          service:service_id (name)
        `)
        .eq('id', bookingId)
        .eq('customer_id', user.id)
        .single()
      if (data) {
        setBooking(data as unknown as BookingDetail)
        if (data.status === 'confirmed') {
          setIsAccepting(false)
          setIsRejecting(false)
          setPaymentPending(false)
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
        }
      }
    } catch {
      // silent
    }
  }, [bookingId])

  const startPolling = useCallback(() => {
    setPaymentPending(true)
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      await refetchBooking()
      if (attempts >= 6) {
        clearInterval(interval)
        pollingRef.current = null
        setIsAccepting(false)
        setIsRejecting(false)
        setPaymentPending(false)
      }
    }, 2500)
    pollingRef.current = interval
  }, [refetchBooking])

  const handleQuoteResponse = async (action: 'accept' | 'reject') => {
    if (!booking) return
    action === 'accept' ? setIsAccepting(true) : setIsRejecting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/bookings/${booking.id}/quote-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!json.success) {
        setActionError(json.error?.message || `Failed to ${action} quote.`)
        action === 'accept' ? setIsAccepting(false) : setIsRejecting(false)
        return
      }

      if (action === 'reject') {
        setBooking((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
        setIsRejecting(false)
        return
      }

      if (!json.data.requires_payment) {
        setBooking((prev) => prev ? { ...prev, status: 'confirmed' } : prev)
        setIsAccepting(false)
        return
      }

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setActionError('Not authenticated.')
        setIsAccepting(false)
        return
      }

      if (!sdkLoaded) {
        setActionError('Payment system not ready. Please refresh and try again.')
        setIsAccepting(false)
        return
      }

      let redirected = false
      const onFlwClose = () => {
        if (redirected) return
        redirected = true
        setTimeout(() => startPolling(), 1000)
      }

      openCheckout({
        tx_ref: json.data.tx_ref,
        amount: json.data.amount,
        customer: {
          email: user.email!,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        },
        customizations: {
          title: 'Everiithing\u2022com',
          description: serviceName ? `${serviceName} \u2014 Top-Up` : 'Quote Top-Up Payment',
        },
        meta: {
          booking_id: booking.id,
        },
        callback: () => onFlwClose(),
        onclose: () => onFlwClose(),
      })
    } catch {
      setActionError('Network error. Please try again.')
      action === 'accept' ? setIsAccepting(false) : setIsRejecting(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!booking) return
    setPdfLoading(true)
    try {
      const { generateBookingPdf } = await import('@/lib/pdf/generateBookingPdf')
      generateBookingPdf({
        id: booking.id,
        serviceName,
        status: booking.status,
        created_at: booking.created_at,
        scheduled_date: booking.scheduled_date,
        scheduled_time: booking.scheduled_time,
        customerName: null,
        address: booking.address,
        lga: booking.lga,
        price_ngn: booking.price_ngn,
        quoted_total_ngn: booking.quoted_total_ngn ?? null,
        topup_owed_ngn: booking.topup_owed_ngn ?? null,
        quote_notes: booking.quote_notes ?? null,
        providerName,
      })
    } catch {
      // silently fail
    }
    setPdfLoading(false)
  }

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending', pending_quote: 'Awaiting Quote', confirmed: 'Confirmed',
      provider_assigned: 'In Progress', in_progress: 'In Progress',
      completed: 'Completed', cancelled: 'Cancelled', disputed: 'Disputed', refunded: 'Refunded',
    }
    return labels[s] || s.replace(/_/g, ' ')
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'var(--color-primary)'
      case 'in_progress': case 'provider_assigned': return 'var(--color-secondary)'
      case 'disputed': return 'var(--color-error)'
      default: return 'var(--color-onSurfaceVariant)'
    }
  }

  return (
    <Modal open={!!bookingId} onClose={onClose}>
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-onSurfaceVariant)' }} />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-token-error py-4">{error}</p>
      )}

      {booking && !loading && !error && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display font-semibold text-lg text-token-onSurface">{serviceName || 'Service'}</p>
              <p className="text-sm text-token-onSurfaceVariant mt-0.5">
                {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed border"
                style={{
                  backgroundColor: 'var(--color-surfaceContainerLow)',
                  borderColor: 'var(--color-outlineVariant)',
                  color: 'var(--color-onSurfaceVariant)',
                }}
              >
                <FileDown size={12} />
                {pdfLoading ? 'Downloading...' : 'PDF'}
              </button>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                style={{ backgroundColor: 'var(--color-surfaceContainerLow)', color: statusColor(booking.status) }}
              >
                {statusLabel(booking.status)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Row label="Call-out fee paid" value={formatNaira(booking.price_ngn)} mono />

            {booking.payment_status === 'in_escrow' && (
              <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                Held in escrow
              </p>
            )}

            <Row label="Booking reference" value={booking.id.slice(0, 8).toUpperCase()} mono />

            {(booking.address || booking.lga) && (
              <Row label="Location" value={[booking.address, booking.lga].filter(Boolean).join(', ')} />
            )}

            <Row label="Booked on" value={formatTimestamp(booking.created_at)} />

            {providerName ? (
              <Row label="Provider" value={providerName} />
            ) : (
              <Row label="Provider" value="Unassigned" />
            )}

            {booking.notes && <Row label="Notes" value={booking.notes} />}

            {(booking.quoted_total_ngn != null || booking.topup_owed_ngn != null) && (
              <div className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-token-onSurfaceVariant">Provider Quote</p>
                {booking.quoted_total_ngn != null && (
                  <Row label="Quoted total" value={formatNaira(booking.quoted_total_ngn)} mono />
                )}
                {booking.topup_owed_ngn != null && (
                  <Row label="Top-up owed" value={formatNaira(booking.topup_owed_ngn)} mono />
                )}
                {booking.quote_notes && <Row label="Quote notes" value={booking.quote_notes} />}

                {booking.status === 'pending_quote' && booking.quoted_total_ngn != null && !paymentPending && (
                  <div className="pt-3 space-y-3">
                    {actionError && (
                      <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>{actionError}</p>
                    )}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={() => handleQuoteResponse('accept')}
                        disabled={isAccepting || isRejecting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-onPrimary)' }}
                      >
                        {isAccepting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Accept Quote
                      </button>
                      <button
                        onClick={() => handleQuoteResponse('reject')}
                        disabled={isAccepting || isRejecting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-onError)' }}
                      >
                        {isRejecting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject Quote
                      </button>
                    </div>
                  </div>
                )}

                {paymentPending && (
                  <div className="pt-3 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                      Processing payment&hellip;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-sm shrink-0" style={{ color: 'var(--color-onSurfaceVariant)' }}>{label}</span>
      <span className={`text-sm font-medium text-right text-token-onSurface ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
