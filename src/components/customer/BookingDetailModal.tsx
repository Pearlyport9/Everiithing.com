'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import type { Booking } from '@/types'

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
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!bookingId) return
    setLoading(true)
    setError('')

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

  const serviceName = booking?.service
    ? (Array.isArray(booking.service) ? booking.service[0]?.name : booking.service.name)
    : null

  const providerName = booking?.provider
    ? (Array.isArray(booking.provider) ? booking.provider[0]?.full_name : booking.provider.full_name)
    : null

  const handleQuoteResponse = async (action: 'accept' | 'reject') => {
    if (!booking) return
    setActionLoading(true)
    setActionError('')
    try {
      const res = await fetch(`/api/bookings/${booking.id}/quote-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (json.success) {
        setBooking((prev) => prev ? { ...prev, status: json.data.status } : prev)
      } else {
        setActionError(json.error?.message || `Failed to ${action} quote.`)
      }
    } catch {
      setActionError('Network error. Please try again.')
    }
    setActionLoading(false)
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
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize shrink-0"
              style={{ backgroundColor: 'var(--color-surfaceContainerLow)', color: statusColor(booking.status) }}
            >
              {statusLabel(booking.status)}
            </span>
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

                {booking.status === 'pending_quote' && booking.quoted_total_ngn != null && (
                  <div className="pt-3 space-y-3">
                    {actionError && (
                      <p className="text-xs font-medium" style={{ color: 'var(--color-error)' }}>{actionError}</p>
                    )}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        onClick={() => handleQuoteResponse('accept')}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-onPrimary)' }}
                      >
                        {actionLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Accept Quote
                      </button>
                      <button
                        onClick={() => handleQuoteResponse('reject')}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-onError)' }}
                      >
                        {actionLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject Quote
                      </button>
                    </div>
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
