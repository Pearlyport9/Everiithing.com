'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Send, Save } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface BookingDetail {
  id: string
  scheduled_date: string
  scheduled_time: string
  address: string
  lga: string
  price_ngn: number
  quoted_total_ngn: number | null
  quote_notes: string | null
  topup_owed_ngn: number | null
  status: string
  payment_status: string
  notes: string | null
  created_at: string
  provider_id: string | null
  customer: { full_name: string | null; email: string | null; phone: string | null } | null
  service: { name: string | null } | null
  provider: { full_name: string | null } | null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

export default function AdminBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [quotedTotal, setQuotedTotal] = useState('')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [sendSuccess, setSendSuccess] = useState('')
  const [saveError, setSaveError] = useState('')
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    if (!id) return
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
            id, scheduled_date, scheduled_time, address, lga,
            price_ngn, quoted_total_ngn, quote_notes, topup_owed_ngn,
            status, payment_status, notes, created_at, provider_id,
            customer:profiles!bookings_customer_id_fkey (full_name, email, phone),
            service:services (name),
            provider:providers (full_name)
          `)
          .eq('id', id)
          .single()

        if (fetchError || !data) {
          setError('Could not load booking details.')
          setLoading(false)
          return
        }

        const raw = data as unknown as BookingDetail
        setBooking(raw)

        if (raw.quoted_total_ngn != null) {
          setQuotedTotal(String(raw.quoted_total_ngn))
        }
        if (raw.quote_notes) {
          setQuoteNotes(raw.quote_notes)
        }
      } catch {
        setError('Something went wrong.')
      }
      setLoading(false)
    }

    load()
  }, [id])

  const serviceName = booking?.service
    ? (Array.isArray(booking.service) ? booking.service[0]?.name : booking.service.name)
    : null

  const customerName = booking?.customer
    ? (Array.isArray(booking.customer) ? booking.customer[0]?.full_name : booking.customer.full_name)
    : null

  const customerEmail = booking?.customer
    ? (Array.isArray(booking.customer) ? booking.customer[0]?.email : booking.customer.email)
    : null

  const customerPhone = booking?.customer
    ? (Array.isArray(booking.customer) ? booking.customer[0]?.phone : booking.customer.phone)
    : null

  const providerName = booking?.provider
    ? (Array.isArray(booking.provider) ? booking.provider[0]?.full_name : booking.provider.full_name)
    : null

  const priceNgn = booking?.price_ngn || 0
  const quotedNum = parseInt(quotedTotal) || 0
  const topupOwed = Math.max(0, quotedNum - priceNgn)

  const isPendingQuote = booking?.status === 'pending_quote'
  const hasQuoteData = booking?.quoted_total_ngn != null

  const clearMessages = () => {
    setSaveSuccess('')
    setSaveError('')
    setSendSuccess('')
    setSendError('')
  }

  const handleSave = async () => {
    clearMessages()
    if (quotedTotal === '' || quotedNum < 0) {
      setSaveError('Quoted total is required and must be 0 or greater.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}/quote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoted_total_ngn: quotedNum, quote_notes: quoteNotes }),
      })
      const json = await res.json()
      if (json.success) {
        setSaveSuccess('Quote saved successfully.')
        setBooking((prev) => prev ? {
          ...prev,
          quoted_total_ngn: json.data.quoted_total_ngn,
          quote_notes: json.data.quote_notes,
          topup_owed_ngn: json.data.topup_owed_ngn,
        } : prev)
      } else {
        setSaveError(json.error?.message || 'Failed to save quote.')
      }
    } catch {
      setSaveError('Network error. Please try again.')
    }
    setSaving(false)
  }

  const handleSend = async () => {
    clearMessages()
    setSending(true)
    try {
      const saveRes = await fetch(`/api/admin/bookings/${id}/quote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoted_total_ngn: quotedNum, quote_notes: quoteNotes }),
      })
      const saveJson = await saveRes.json()
      if (!saveJson.success) {
        setSendError(saveJson.error?.message || 'Failed to save quote before sending.')
        setSending(false)
        return
      }
      setBooking((prev) => prev ? {
        ...prev,
        quoted_total_ngn: saveJson.data.quoted_total_ngn,
        quote_notes: saveJson.data.quote_notes,
        topup_owed_ngn: saveJson.data.topup_owed_ngn,
      } : prev)

      const sendRes = await fetch(`/api/admin/bookings/${id}/quote`, {
        method: 'POST',
      })
      const sendJson = await sendRes.json()
      if (sendJson.success) {
        setSendSuccess('Quote emailed to customer successfully.')
      } else {
        setSendError(sendJson.error?.message || 'Failed to send quote email.')
      }
    } catch {
      setSendError('Network error. Please try again.')
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)' }}>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-onSurfaceVariant)' }} />
          <p className="text-sm mt-4" style={{ color: 'var(--color-onSurfaceVariant)' }}>Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)' }}>
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft size={16} />
          Back to Bookings
        </Link>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle size={28} style={{ color: 'var(--color-error)' }} />
          <p className="font-display font-semibold text-lg mt-4" style={{ color: 'var(--color-onSurface)' }}>
            {error || 'Booking not found'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            {error ? '' : 'The booking you\'re looking for does not exist.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 md:p-8" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)' }}>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-colors hover:opacity-70"
        style={{ color: 'var(--color-primary)' }}
      >
        <ArrowLeft size={16} />
        Back to Bookings
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {serviceName || 'Custom Request'}
          </h1>
          {customerName && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              {customerName}
              {customerPhone && <span> &middot; {customerPhone}</span>}
              {customerEmail && <span> &middot; {customerEmail}</span>}
            </p>
          )}
        </div>
        <StatusBadge status={booking.status as any} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div
          className="rounded-xl p-4 md:p-5 border"
          style={{ backgroundColor: 'var(--color-surfaceContainerLow)', borderColor: 'var(--color-outlineVariant)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Schedule
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-onSurface)' }}>
            {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Booked on {formatTimestamp(booking.created_at)}
          </p>
        </div>

        <div
          className="rounded-xl p-4 md:p-5 border"
          style={{ backgroundColor: 'var(--color-surfaceContainerLow)', borderColor: 'var(--color-outlineVariant)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Location
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-onSurface)' }}>
            {booking.address || '\u2014'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            {booking.lga || ''}
          </p>
        </div>

        <div
          className="rounded-xl p-4 md:p-5 border"
          style={{ backgroundColor: 'var(--color-surfaceContainerLow)', borderColor: 'var(--color-outlineVariant)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Payment
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-onSurface)' }}>
            Call-out fee: {formatNaira(booking.price_ngn)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            {booking.payment_status === 'in_escrow' ? 'Held in escrow' : booking.payment_status.replace(/_/g, ' ')}
          </p>
          {booking.notes && (
            <p className="text-xs mt-2 italic" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              Client notes: {booking.notes}
            </p>
          )}
        </div>

        <div
          className="rounded-xl p-4 md:p-5 border"
          style={{ backgroundColor: 'var(--color-surfaceContainerLow)', borderColor: 'var(--color-outlineVariant)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Provider
          </p>
          {providerName ? (
            <p className="text-sm font-medium" style={{ color: 'var(--color-onSurface)' }}>
              {providerName}
            </p>
          ) : (
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-tertiaryContainer)', color: 'var(--color-onTertiaryContainer)' }}
            >
              Unassigned
            </span>
          )}
        </div>
      </div>

      {isPendingQuote && (
        <div
          className="rounded-xl p-5 md:p-6 border"
          style={{ borderColor: 'var(--color-outlineVariant)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Save size={18} style={{ color: 'var(--color-onPrimary)' }} />
            </div>
            <div>
              <p className="font-display font-semibold text-base" style={{ color: 'var(--color-onSurface)' }}>
                Provider Quote
              </p>
              <p className="text-xs" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                Set the quoted total and notes for this booking
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 15%, transparent)', color: 'var(--color-success)' }}>
              <CheckCircle size={16} />
              {saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 15%, transparent)', color: 'var(--color-error)' }}>
              <AlertCircle size={16} />
              {saveError}
            </div>
          )}
          {sendSuccess && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 15%, transparent)', color: 'var(--color-success)' }}>
              <CheckCircle size={16} />
              {sendSuccess}
            </div>
          )}
          {sendError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 text-sm font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--color-error) 15%, transparent)', color: 'var(--color-error)' }}>
              <AlertCircle size={16} />
              {sendError}
            </div>
          )}

          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-onSurface)' }}>
                Quoted total (₦)
              </label>
              <input
                type="number"
                min="0"
                value={quotedTotal}
                onChange={(e) => { clearMessages(); setQuotedTotal(e.target.value) }}
                placeholder="Enter the total quoted amount"
                className="w-full border rounded-lg px-4 py-2.5 text-sm bg-transparent outline-none transition-colors focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-onSurface)' }}>
                Quote notes
              </label>
              <textarea
                value={quoteNotes}
                onChange={(e) => { clearMessages(); setQuoteNotes(e.target.value) }}
                placeholder="Describe what the quote covers (materials, labour, etc.)"
                rows={3}
                className="w-full border rounded-lg px-4 py-2.5 text-sm bg-transparent outline-none transition-colors focus:border-[var(--color-primary)] resize-none"
                style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
              />
            </div>

            <div
              className="rounded-lg px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surfaceContainerLow)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                Top-up owed
              </span>
              <span className="font-mono font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                {formatNaira(topupOwed)}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || sending || quotedTotal === ''}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-onPrimary)' }}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Saving...</>
                ) : (
                  <><Save size={16} /> Save Quote</>
                )}
              </button>
              <button
                onClick={handleSend}
                disabled={sending || saving || quotedTotal === ''}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-onSecondary)' }}
              >
                {sending ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Send Quote</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isPendingQuote && hasQuoteData && (
        <div
          className="rounded-xl p-5 md:p-6 border"
          style={{ borderColor: 'var(--color-outlineVariant)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Saved Quote
          </p>
          <div className="space-y-3 max-w-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>Quoted total</span>
              <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-onSurface)' }}>
                {formatNaira(booking.quoted_total_ngn!)}
              </span>
            </div>
            {booking.topup_owed_ngn != null && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>Top-up owed</span>
                <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-onSurface)' }}>
                  {formatNaira(booking.topup_owed_ngn)}
                </span>
              </div>
            )}
            {booking.quote_notes && (
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                  Quote notes
                </p>
                <p className="text-sm" style={{ color: 'var(--color-onSurface)' }}>
                  {booking.quote_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isPendingQuote && !hasQuoteData && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            This booking does not require a quote.
          </p>
        </div>
      )}
    </div>
  )
}
