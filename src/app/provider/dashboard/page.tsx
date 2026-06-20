import { createClient } from '@/lib/supabase/server'
import { Wallet, TrendingUp, Star, Clock } from 'lucide-react'

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

export default async function ProviderDashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  let firstName = user?.user_metadata?.full_name?.split(' ')[0]
    || user?.user_metadata?.name?.split(' ')[0]
    || 'Provider'

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

  const { data: provider } = userId
    ? await supabase.from('providers').select('verification_status').eq('id', userId).single()
    : { data: null }

  const [{ count: activeJobs }, { data: earningsData }, { count: completedJobs }] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('provider_id', userId).in('status', ['confirmed', 'provider_assigned', 'in_progress']),
    supabase.from('bookings').select('price_ngn').eq('provider_id', userId).in('payment_status', ['paid', 'in_escrow', 'released']),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('provider_id', userId).eq('status', 'completed'),
  ])

  const totalEarnings = earningsData?.reduce((sum, b) => sum + (b.price_ngn || 0), 0) || 0
  const isPending = provider?.verification_status !== 'approved'

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
            Manage your service jobs and earnings
          </p>
        </div>
      </div>

      {isPending && (
        <div
          className="rounded-2xl p-4 mb-6 border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-tertiary) 10%, transparent)',
            borderColor: 'color-mix(in srgb, var(--color-tertiary) 30%, transparent)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--color-tertiary)' }}>
            Your profile is pending verification. We&apos;ll review your application within 48 hours.
          </p>
        </div>
      )}

      {/* Mobile: single hero card with stats */}
      <div
        className="md:hidden rounded-2xl p-7 mb-6 flex items-stretch"
        style={{ backgroundColor: 'var(--color-inverseSurface)' }}
      >
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>{formatNaira(0)}</p>
          <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>Balance</p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>{formatNaira(totalEarnings)}</p>
          <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>Earnings</p>
        </div>
        <div className="flex-1 text-center">
          <p className="font-display font-bold text-2xl" style={{ color: 'var(--color-inverseOnSurface)' }}>{activeJobs ?? 0}</p>
          <p className="text-[9px] font-medium uppercase whitespace-nowrap mt-2" style={{ color: 'var(--color-inverseOnSurface)' }}>Active Jobs</p>
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
              Available Balance
            </p>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Wallet size={16} style={{ color: 'var(--color-onPrimary)' }} />
            </div>
          </div>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {formatNaira(0)}
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
              Total Earnings
            </p>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-tertiary)' }}
            >
              <TrendingUp size={16} style={{ color: 'var(--color-onTertiary)' }} />
            </div>
          </div>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {formatNaira(totalEarnings)}
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
              style={{ backgroundColor: 'var(--color-inverseSurface)' }}
            >
              <Clock size={16} style={{ color: 'var(--color-inverseOnSurface)' }} />
            </div>
          </div>
          <p className="font-display font-bold text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            {activeJobs ?? 0}
          </p>
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            {completedJobs ?? 0} completed
          </p>
        </div>
      </div>
    </div>
  )
}
