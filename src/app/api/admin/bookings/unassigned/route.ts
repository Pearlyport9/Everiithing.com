import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const admin = createAdminClient()

    const { data: bookings } = await admin
      .from('bookings')
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        address,
        lga,
        price_ngn,
        status,
        payment_status,
        created_at,
        customer:profiles!bookings_customer_id_fkey (full_name, phone),
        service:services (name)
      `)
      .is('provider_id', null)
      .in('status', ['confirmed'])
      .order('created_at', { ascending: false })

    const { data: verifiedProviders } = await admin
      .from('providers')
      .select(`
        id,
        full_name,
        phone,
        email,
        verification_status,
        service_lgas,
        provider_categories (
          category:service_categories (id, name)
        )
      `)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings ?? [],
        verifiedProviders: verifiedProviders ?? [],
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR'
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
