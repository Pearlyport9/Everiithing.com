import { createClient } from '@/lib/supabase/server'
import { CalendarCheck, CalendarPlus, Clock } from 'lucide-react'

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

export default async function BookingsView() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      price_ngn,
      status,
      notes,
      created_at,
      provider_id,
      service:service_id (name)
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  const providerIds = Array.from(new Set(bookings?.filter((b) => b.provider_id).map((b) => b.provider_id) || []))
  const { data: providerData } = providerIds.length > 0
    ? await supabase.from('providers').select('id, full_name').in('id', providerIds)
    : { data: [] }
  const providerMap = new Map(providerData?.map((p) => [p.id, p.full_name]) || [])

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-token-onSurface mb-8">
        My Bookings
      </h1>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-token-surface rounded-xl p-12 shadow-sm border border-token-outlineVariant text-center">
          <CalendarCheck size={48} className="mx-auto text-token-outline mb-4" />
          <h2 className="text-lg font-display font-semibold text-token-onSurface mb-2">
            No bookings yet
          </h2>
          <p className="text-token-onSurfaceVariant text-sm mb-6">
            When you book a service, your bookings will appear here.
          </p>
          <a href="/dashboard/book" className="btn-primary inline-block">
            Book a Service
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const serviceName = (booking.service as unknown as { name?: string })?.name
            const isCustomRequest = !serviceName
            const providerName = booking.provider_id ? providerMap.get(booking.provider_id) : null

            return (
              <div
                key={booking.id}
                className="rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-200 ease-out hover:shadow-md border border-[--md-outline-variant]" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCustomRequest ? 'bg-[--md-tertiary]/20' : 'bg-[--md-primary-container]'}`}>
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
                      {booking.price_ngn > 0 ? formatNaira(booking.price_ngn) : '—'}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
