'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { BookingDetailModal } from '@/components/customer/BookingDetailModal'

interface BookingRow {
  id: string
  scheduled_date: string
  scheduled_time: string
  price_ngn: number
  status: string
  provider_id: string | null
  service: { name?: string }[] | { name?: string } | null
}

function statusStyle(status: string) {
  switch (status) {
    case 'completed':
      return { color: 'var(--color-primary)' }
    case 'in_progress':
    case 'provider_assigned':
      return { color: 'var(--color-secondary)' }
    case 'disputed':
      return { color: 'var(--color-error)' }
    default:
      return { color: 'var(--color-onSurfaceVariant)' }
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'provider_assigned': return 'In Progress'
    case 'in_progress': return 'In Progress'
    case 'completed': return 'Completed'
    case 'disputed': return 'Disputed'
    case 'pending': return 'Pending'
    case 'pending_quote': return 'Awaiting Quote'
    case 'confirmed': return 'Confirmed'
    case 'cancelled': return 'Cancelled'
    case 'refunded': return 'Refunded'
    default: return status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  }
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

interface Props {
  bookings: BookingRow[]
  providerMap: Map<string, { full_name: string }>
}

export function BookingTableRows({ bookings, providerMap }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <>
      {bookings.map((booking) => {
        const provider = booking.provider_id ? providerMap.get(booking.provider_id) : null
        return (
          <tr
            key={booking.id}
            className="border-b transition-all duration-150 ease-out hover:bg-[--color-surfaceContainerLow]"
            style={{ borderColor: 'var(--color-outlineVariant)' }}
          >
            <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--color-onSurface)' }}>
              {formatDate(booking.scheduled_date, booking.scheduled_time)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: 'var(--color-onSurface)' }}>
              {Array.isArray(booking.service) ? (booking.service[0]?.name || 'Custom Request') : (booking.service?.name || 'Custom Request')}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--color-primaryContainer)',
                    color: 'var(--color-onPrimaryContainer)',
                  }}
                >
                  {provider?.full_name
                    ? provider.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                    : '—'}
                </div>
                <span style={{ color: 'var(--color-onSurface)' }}>
                  {provider?.full_name || 'Unassigned'}
                </span>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap font-mono font-medium" style={{ color: 'var(--color-onSurface)' }}>
              {formatNaira(booking.price_ngn)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap font-semibold" style={statusStyle(booking.status)}>
              {statusLabel(booking.status)}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <button
                className="w-8 h-8 rounded-lg border flex items-center justify-center bg-transparent cursor-pointer transition-colors duration-150 hover:bg-[--color-surfaceContainerLow]"
                style={{ borderColor: 'var(--color-outlineVariant)' }}
                aria-label="View booking"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedId(booking.id)
                }}
              >
                <Eye size={15} style={{ color: 'var(--color-onSurfaceVariant)' }} />
              </button>
            </td>
          </tr>
        )
      })}

      <BookingDetailModal
        bookingId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
