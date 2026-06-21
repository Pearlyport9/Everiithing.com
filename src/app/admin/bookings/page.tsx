'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, CalendarCheck, ArrowRight, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AssignProviderControl } from '@/components/admin/AssignProviderControl'

interface Booking {
  id: string
  scheduled_date: string
  scheduled_time: string
  price_ngn: number
  status: string
  payment_status: string
  created_at: string
  provider_id: string | null
  customer: { full_name: string; phone: string } | null
  service: { name: string } | null
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

type FilterStatus = typeof STATUS_TABS[number]['key']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [assignedProviders, setAssignedProviders] = useState<Record<string, { id: string; name: string }>>({})

  const handleAssigned = (bookingId: string, providerId: string, providerName: string) => {
    setAssignedProviders((prev) => ({ ...prev, [bookingId]: { id: providerId, name: providerName } }))
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, provider_id: providerId } : b)))
  }

  const fetchBookings = useCallback(async (s: FilterStatus, p: number, append: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings?status=${s}&page=${p}`)
      const json = await res.json()
      if (json.success) {
        setBookings((prev) => append ? [...prev, ...json.data.bookings] : json.data.bookings)
        setTotal(json.data.total)
        setHasMore(json.data.hasMore)
        setPage(p)
      }
    } catch {
      // silent
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setBookings([])
    setPage(1)
    fetchBookings(status, 1, false)
  }, [status, fetchBookings])

  const handleLoadMore = () => {
    fetchBookings(status, page + 1, true)
  }

  const filtered = bookings.filter((b) => {
    if (!search) return true
    const q = search.toLowerCase()
    const serviceName = b.service?.name?.toLowerCase() || ''
    const customerName = b.customer?.full_name?.toLowerCase() || ''
    return serviceName.includes(q) || customerName.includes(q)
  })

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            All Bookings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            {total} total booking{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto scrollable-x scrollbar-hide pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                status === tab.key
                  ? 'bg-[var(--color-primary)] text-[var(--color-onPrimary)]'
                  : 'bg-transparent text-[var(--color-onSurfaceVariant)] hover:bg-[var(--color-surfaceContainerLow)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-onSurfaceVariant)' }}
          />
          <input
            type="text"
            placeholder="Search by service or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-9 py-2 rounded-xl text-sm border bg-transparent outline-none"
            style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X size={14} style={{ color: 'var(--color-onSurfaceVariant)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-8 md:py-16">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--color-primaryContainer)' }}
          >
            <CalendarCheck size={28} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p className="font-display font-semibold text-lg" style={{ color: 'var(--color-onSurface)' }}>
            {search ? 'No bookings match your search' : 'No bookings found'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            {search ? 'Try a different search term or clear the filter.' : 'There are no bookings with this status yet.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile/tablet: card list */}
          <div className="lg:hidden space-y-3">
            {filtered.map((b) => {
              const serviceName = b.service?.name || '\u2014'
              const customerName = b.customer?.full_name || '\u2014'
              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="block rounded-xl p-4 border"
                  style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', borderColor: 'var(--color-outlineVariant)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: 'var(--color-primaryContainer)' }}
                    >
                      <span className="text-xs font-bold" style={{ color: 'var(--color-onPrimaryContainer)' }}>
                        {serviceName[0] || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-onSurface)' }}>
                        {serviceName}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                        {formatDate(b.scheduled_date)} &middot; {b.scheduled_time} &middot; {customerName}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {formatNaira(b.price_ngn)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={b.status as any} />
                      </div>
                      {!b.provider_id && b.status === 'confirmed' && b.payment_status === 'in_escrow' && (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                          <AssignProviderControl bookingId={b.id} onAssigned={handleAssigned} />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block overflow-x-auto scrollable-x">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                  <th className="px-3 py-2">Date & Time</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Provider</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                {filtered.map((b) => {
                  const serviceName = b.service?.name || '\u2014'
                  const customerName = b.customer?.full_name || '\u2014'
                  return (
                    <tr key={b.id} className="transition-colors hover:bg-token-surfaceContainerLow">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link href={`/admin/bookings/${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                          {formatDate(b.scheduled_date)} at {b.scheduled_time}
                        </Link>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium">
                        <Link href={`/admin/bookings/${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                          {serviceName}
                        </Link>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link href={`/admin/bookings/${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                          {customerName}
                        </Link>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {b.provider_id ? (
                          <Link href={`/admin/bookings/${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                            {assignedProviders[b.id]?.name || 'Assigned'}
                          </Link>
                        ) : b.status === 'confirmed' && b.payment_status === 'in_escrow' ? (
                          <AssignProviderControl bookingId={b.id} onAssigned={handleAssigned} />
                        ) : (
                          <Link href={`/admin/bookings/${b.id}`} className="block">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: 'var(--color-tertiaryContainer)', color: 'var(--color-onTertiaryContainer)' }}
                            >
                              Unassigned
                            </span>
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono">
                        <Link href={`/admin/bookings/${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                          {formatNaira(b.price_ngn)}
                        </Link>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link href={`/admin/bookings/${b.id}`} className="block">
                          <StatusBadge status={b.status as any} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-onPrimary)' }}
              >
                {loading ? 'Loading...' : 'Load More'}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
