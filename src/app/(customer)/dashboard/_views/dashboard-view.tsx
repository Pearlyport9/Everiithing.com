import { createClient } from '@/lib/supabase/server'
import { CalendarPlus, Calendar, Clock, Wallet } from 'lucide-react'
import { BookingTableRows } from '@/components/customer/BookingTableRows'

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

function statusLabel(s: string) {
  const labels: Record<string, string> = {
    provider_assigned: 'In Progress', in_progress: 'In Progress', completed: 'Completed',
    disputed: 'Disputed', pending: 'Pending', pending_quote: 'Awaiting Quote',
    confirmed: 'Confirmed', cancelled: 'Cancelled', refunded: 'Refunded',
  }
  return labels[s] || s.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
}

export default async function DashboardView() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  let firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.user_metadata?.name?.split(' ')[0]
    || 'Guest'

  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    if (profile?.full_name) {
      firstName = profile.full_name.split(' ')[0]
    }
  }

  const [{ count: totalBookings }, { count: activeJobs }, { data: spentData }] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('customer_id', userId),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', userId)
      .in('status', ['confirmed', 'provider_assigned', 'in_progress']),
    supabase
      .from('bookings')
      .select('price_ngn')
      .eq('customer_id', userId)
      .in('payment_status', ['paid', 'in_escrow', 'released']),
  ])

  const totalSpent = spentData?.reduce((sum, b) => sum + (b.price_ngn || 0), 0) || 0

  const { data: recentBookings } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      price_ngn,
      status,
      created_at,
      provider_id,
      service:service_id (name)
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const providerIds = Array.from(new Set(recentBookings?.filter((b) => b.provider_id).map((b) => b.provider_id) || []))

  const { data: providerProfiles } = providerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', providerIds)
    : { data: [] }

  const providerMap = new Map(providerProfiles?.map((p) => [p.id, p]) || [])

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 4px 24px rgba(13, 16, 33, 0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            Welcome, {firstName}!
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Manage your home & office service bookings in one place
          </p>
        </div>

      </div>

      {/* Mobile: single hero card with 3 stats */}
      <div
        className="md:hidden rounded-2xl p-7 mb-6"
        style={{ backgroundColor: 'var(--color-inverseSurface)' }}
      >
        <div className="flex items-stretch">
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>
              {totalBookings ?? 0}
            </p>
            <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>
              Total Bookings
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>
              {activeJobs ?? 0}
            </p>
            <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>
              Active Jobs
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>
              {formatNaira(totalSpent)}
            </p>
            <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>
              Total Spent
            </p>
          </div>
        </div>
      </div>

      {/* Tablet+: 3 individual stat cards */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div
          className="rounded-2xl p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(13,16,33,0.12)]"
          style={{
            backgroundColor: 'var(--color-surfaceContainerLow)',
            boxShadow: '0 2px 8px rgba(13,16,33,0.08)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              Total Bookings
            </p>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Calendar size={16} style={{ color: 'var(--color-onPrimary)' }} />
            </div>
          </div>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {totalBookings ?? 0}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(13,16,33,0.12)]"
          style={{
            backgroundColor: 'var(--color-surfaceContainerLow)',
            boxShadow: '0 2px 8px rgba(13,16,33,0.08)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              Active Jobs
            </p>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-tertiary)' }}
            >
              <Clock size={16} style={{ color: 'var(--color-onTertiary)' }} />
            </div>
          </div>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {activeJobs ?? 0}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(13,16,33,0.12)]"
          style={{
            backgroundColor: 'var(--color-surfaceContainerLow)',
            boxShadow: '0 2px 8px rgba(13,16,33,0.08)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              Total Spent
            </p>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-inverseSurface)' }}
            >
              <Wallet size={16} style={{ color: 'var(--color-inverseOnSurface)' }} />
            </div>
          </div>
          <p className="font-mono font-bold text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {formatNaira(totalSpent)}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-onSurface)' }}>
            Recent Bookings
          </h2>
          <select
            className="text-sm border rounded-lg px-3 py-1.5 bg-transparent cursor-pointer"
            style={{
              borderColor: 'var(--color-outlineVariant)',
              color: 'var(--color-onSurfaceVariant)',
            }}
          >
            <option value="all">This Month</option>
            <option value="last">Last Month</option>
            <option value="3m">Last 3 Months</option>
          </select>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--color-onSurfaceVariant)' }}>
          View and manage your recent service bookings
        </p>

        {!recentBookings || recentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-16">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-primaryContainer)' }}
            >
              <CalendarPlus size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="font-display font-semibold text-lg" style={{ color: 'var(--color-onSurface)' }}>
              No bookings yet
            </p>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              Book your first service to get started
            </p>
            <a
              href="/dashboard/book"
              className="inline-flex items-center px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-onPrimary)',
              }}
            >
              Book a Service
            </a>
          </div>
        ) : (
          <>
            {/* Mobile/tablet: card list */}
            <div className="lg:hidden space-y-3">
              {recentBookings.map((booking) => {
                const provider = booking.provider_id ? providerMap.get(booking.provider_id) : null
                const svc = booking.service as { name?: string }[] | { name?: string } | null
                const serviceName = Array.isArray(svc) ? (svc[0]?.name || 'Custom Request') : (svc?.name || 'Custom Request')
                const statusBadgeColors = () => {
                  const s = booking.status
                  if (s === 'completed') return { bg: 'var(--color-primaryContainer)', fg: 'var(--color-onPrimaryContainer)' }
                  if (s === 'in_progress' || s === 'provider_assigned') return { bg: 'var(--color-secondaryContainer)', fg: 'var(--color-onSecondaryContainer)' }
                  if (s === 'disputed') return { bg: 'var(--color-errorContainer)', fg: 'var(--color-onErrorContainer)' }
                  return { bg: 'var(--color-surfaceVariant)', fg: 'var(--color-onSurfaceVariant)' }
                }
                const badge = statusBadgeColors()
                return (
                  <div
                    key={booking.id}
                    className="rounded-xl p-4 border"
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
                          {formatDate(booking.scheduled_date, booking.scheduled_time)}
                          {provider ? ` · ${provider.full_name}` : ' · Unassigned'}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: badge.bg, color: badge.fg }}
                        >
                          {statusLabel(booking.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block overflow-x-auto scrollable-x">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-xs font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--color-inverseSurface)',
                      color: 'var(--color-inverseOnSurface)',
                    }}
                  >
                    <th className="px-4 py-3 rounded-l-xl">Date & Time</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <BookingTableRows bookings={recentBookings ?? []} providerMap={providerMap} />
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
