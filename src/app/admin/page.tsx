import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Users, ShieldCheck, Calendar, Scale, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FEATURES = {
  disputes: false,
}

const statCards = [
  { label: 'Total Providers', icon: Users, color: 'var(--color-primary)' },
  { label: 'Pending Verification', icon: ShieldCheck, color: 'var(--color-tertiary)' },
  { label: 'Active Bookings', icon: Calendar, color: 'var(--color-secondary)' },
  { label: 'Open Disputes', icon: Scale, color: 'var(--color-error, hsl(0, 65%, 45%))' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

export default async function AdminDashboard() {
  const supabase = createClient()
  const admin = createAdminClient()

  const [{ count: totalProviders }, { count: pendingVerification }, { count: activeBookings }, { count: openDisputes }] = await Promise.all([
    supabase.from('providers').select('*', { count: 'exact', head: true }),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'provider_assigned', 'in_progress']),
    FEATURES.disputes
      ? supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open')
      : { count: 0 },
  ])

  const stats = [totalProviders ?? 0, pendingVerification ?? 0, activeBookings ?? 0, openDisputes ?? 0]

  const gridCols = FEATURES.disputes
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-3'

  const { data: allBookings } = await admin
    .from('bookings')
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      price_ngn,
      status,
      created_at,
      provider_id,
      service:services (name),
      customer:profiles!bookings_customer_id_fkey (full_name)
    `)

  const unassigned = (allBookings ?? [])
    .filter((b) => !b.provider_id && b.status === 'confirmed')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 5)

  const unassignedIds = new Set(unassigned.map((b) => b.id))
  const fillCount = 5 - unassigned.length

  const filled = fillCount > 0
    ? (allBookings ?? [])
        .filter((b) => !unassignedIds.has(b.id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, fillCount)
    : []

  const previewBookings = [...unassigned, ...filled]

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)',
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Manage your platform in one place
          </p>
        </div>
      </div>

      {/* Mobile: single hero card with stats */}
      <div
        className="md:hidden rounded-2xl p-7 mb-4 md:mb-6 flex items-stretch"
        style={{ backgroundColor: 'var(--color-inverseSurface)' }}
      >
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>{stats[0]}</p>
          <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>Total Providers</p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>{stats[1]}</p>
          <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>Pending</p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>{stats[2]}</p>
          <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>Active Bookings</p>
        </div>
      </div>

      {/* Tablet+: stat cards grid */}
      <div className={`hidden md:grid ${gridCols} gap-4 md:gap-6 mb-8`}>
        {statCards.map((card, i) => {
          if (!FEATURES.disputes && card.label === 'Open Disputes') return null
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-2xl p-6 min-h-[150px] flex flex-col transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(13,16,33,0.12)]"
              style={{
                backgroundColor: 'var(--color-surfaceContainerLow)',
                boxShadow: '0 2px 8px rgba(13,16,33,0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                  {card.label}
                </p>
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.color }}
                >
                  <Icon size={18} style={{ color: 'var(--color-onPrimary)' }} />
                </div>
              </div>
              <p className="font-display font-bold text-3xl mt-4" style={{ color: 'var(--color-onSurface)' }}>
                {stats[i]}
              </p>
            </div>
          )
        })}
      </div>

      <div className="md:border-t pt-4 md:pt-6" style={{ borderColor: 'var(--color-outlineVariant)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-onSurface)' }}>
              Needs Attention
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              Bookings waiting to be assigned
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {previewBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              No bookings yet
            </p>
          </div>
        ) : (
          <>
            {/* Mobile/tablet: card list */}
            <div className="lg:hidden space-y-3">
              {previewBookings.map((b) => {
                const row = b as { id: string; scheduled_date: string; scheduled_time: string; price_ngn: number; status: string; created_at: string; provider_id: string | null; service: { name?: string }[] | { name?: string } | null; customer: { full_name?: string }[] | { full_name?: string } | null }
                const serviceName = Array.isArray(row.service) ? row.service[0]?.name : row.service?.name
                const isUnassigned = !b.provider_id
                return (
                  <a
                    key={b.id}
                    href={`/admin/bookings?id=${b.id}`}
                    className="block rounded-xl p-4 border"
                    style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', borderColor: 'var(--color-outlineVariant)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--color-primaryContainer)' }}
                      >
                        <span className="text-xs font-bold" style={{ color: 'var(--color-onPrimaryContainer)' }}>
                          {serviceName?.[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-onSurface)' }}>
                          {serviceName || '\u2014'}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                          {formatDate(b.scheduled_date)} · {b.scheduled_time} · {isUnassigned ? 'Unassigned' : 'Assigned'}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {isUnassigned ? (
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: 'var(--color-tertiaryContainer)', color: 'var(--color-onTertiaryContainer)' }}
                          >
                            Unassigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ backgroundColor: 'var(--color-primaryContainer)', color: 'var(--color-onPrimaryContainer)' }}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
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
                    <th className="px-3 py-2 hidden lg:table-cell">Customer</th>
                    <th className="px-3 py-2">Provider</th>
                    <th className="px-3 py-2 hidden lg:table-cell">Amount</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-outlineVariant)' }}>
                  {previewBookings.map((b) => {
                    const row = b as { id: string; scheduled_date: string; scheduled_time: string; price_ngn: number; status: string; created_at: string; provider_id: string | null; service: { name?: string }[] | { name?: string } | null; customer: { full_name?: string }[] | { full_name?: string } | null }
                    const serviceName = Array.isArray(row.service) ? row.service[0]?.name : row.service?.name
                    const customerName = Array.isArray(row.customer) ? row.customer[0]?.full_name : row.customer?.full_name

                    return (
                      <tr key={b.id} className="transition-colors hover:bg-token-surfaceContainerLow">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <a href={`/admin/bookings?id=${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                            {formatDate(b.scheduled_date)}<span className="hidden sm:inline">{` at ${b.scheduled_time}`}</span>
                          </a>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-medium">
                          <a href={`/admin/bookings?id=${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                            {serviceName || '\u2014'}
                          </a>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap hidden lg:table-cell">
                          <a href={`/admin/bookings?id=${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                            {customerName || '\u2014'}
                          </a>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <a href={`/admin/bookings?id=${b.id}`} className="block">
                            {b.provider_id ? (
                              <span style={{ color: 'var(--color-onSurface)' }}>Assigned</span>
                            ) : (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: 'var(--color-tertiaryContainer)', color: 'var(--color-onTertiaryContainer)' }}
                              >
                                Unassigned
                              </span>
                            )}
                          </a>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono hidden lg:table-cell">
                          <a href={`/admin/bookings?id=${b.id}`} className="block" style={{ color: 'var(--color-onSurface)' }}>
                            {formatNaira(b.price_ngn)}
                          </a>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap capitalize">
                          <a href={`/admin/bookings?id=${b.id}`} className="block" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                            {b.status.replace(/_/g, ' ')}
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
