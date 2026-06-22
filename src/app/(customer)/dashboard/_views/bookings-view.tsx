import { createClient } from '@/lib/supabase/server'
import { CalendarCheck } from 'lucide-react'
import { BookingCards } from '@/components/customer/BookingCards'

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
      quoted_total_ngn,
      topup_owed_ngn,
      quote_notes,
      service:service_id (name)
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  const providerIds = Array.from(new Set(bookings?.filter((b) => b.provider_id).map((b) => b.provider_id) || []))
  const { data: providerData } = providerIds.length > 0
    ? await supabase.from('providers').select('id, full_name').in('id', providerIds)
    : { data: [] }
  const providerMap: Record<string, string> = {}
  for (const p of providerData ?? []) {
    providerMap[p.id] = p.full_name
  }

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
        <BookingCards bookings={bookings} providerMap={providerMap} />
      )}
    </div>
  )
}
