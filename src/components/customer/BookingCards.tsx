'use client'

import { useState } from 'react'
import { CalendarPlus, Clock } from 'lucide-react'
import { BookingDetailModal } from './BookingDetailModal'

interface BookingCardItem {
  id: string
  scheduled_date: string
  scheduled_time: string
  price_ngn: number
  status: string
  notes: string | null
  created_at: string
  provider_id: string | null
  quoted_total_ngn: number | null
  topup_owed_ngn: number | null
  quote_notes: string | null
  service: { name?: string } | { name?: string }[] | null
}

interface BookingCardsProps {
  bookings: BookingCardItem[]
  providerMap: Record<string, string>
}

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

function formatDate(dateStr: string, timeStr: string) {
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${month} ${day}, ${year} at ${timeStr}`
}

export function BookingCards({ bookings, providerMap }: BookingCardsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      <div className="space-y-3">
        {bookings.map((booking) => {
          const service = Array.isArray(booking.service) ? booking.service[0] : booking.service
          const serviceName = service?.name
          const isCustomRequest = !serviceName
          const providerName = booking.provider_id ? providerMap[booking.provider_id] : null

          return (
            <button
              key={booking.id}
              onClick={() => setSelectedId(booking.id)}
              className="w-full text-left rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-200 ease-out hover:shadow-md border cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surfaceContainerLowest)',
                borderColor: 'var(--color-outlineVariant)',
              }}
            >
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCustomRequest ? 'bg-[--md-tertiary]/20' : 'bg-[--md-primary-container]'
                  }`}
                >
                  {isCustomRequest ? (
                    <Clock size={18} className="text-[--md-tertiary]" />
                  ) : (
                    <CalendarPlus size={18} className="text-[--md-primary]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-base text-[--md-on-surface] truncate">
                    {isCustomRequest ? 'Custom Request' : serviceName}
                  </p>
                  <p className="text-sm text-[--md-on-surface-variant] mt-0.5">
                    {formatDate(booking.scheduled_date, booking.scheduled_time)}
                  </p>
                  {providerName && (
                    <p className="text-sm font-medium text-[--md-primary] mt-0.5">
                      Provider: {providerName}
                    </p>
                  )}
                  {booking.notes && (
                    <p className="text-xs text-[--md-on-surface-variant] mt-1 line-clamp-1">
                      {booking.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <p className="font-mono font-semibold text-sm text-[--md-on-surface]">
                    {booking.price_ngn > 0 ? formatNaira(booking.price_ngn) : '\u2014'}
                  </p>
                </div>
                {isCustomRequest ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[--md-tertiary]/10 text-[--md-tertiary]">
                    Awaiting Quote
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'completed'
                      ? 'bg-[--md-primary-container] text-[--md-on-primary-container]'
                      : booking.status === 'confirmed' || booking.status === 'provider_assigned' || booking.status === 'in_progress'
                      ? 'bg-[--md-primary]/10 text-[--md-primary]'
                      : booking.status === 'cancelled' || booking.status === 'disputed'
                      ? 'bg-[--md-error]/10 text-[--md-error]'
                      : 'bg-[--md-secondary]/10 text-[--md-secondary]'
                  }`}>
                    {booking.status === 'pending' ? 'Pending' :
                     booking.status === 'confirmed' ? 'Confirmed' :
                     booking.status === 'provider_assigned' ? 'In Progress' :
                     booking.status === 'in_progress' ? 'In Progress' :
                     booking.status === 'completed' ? 'Completed' :
                     booking.status === 'disputed' ? 'Disputed' :
                     booking.status === 'cancelled' ? 'Cancelled' :
                     booking.status === 'refunded' ? 'Refunded' :
                     booking.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <BookingDetailModal
        bookingId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
