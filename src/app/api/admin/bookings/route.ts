import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const admin = createAdminClient()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = 20

    let query = admin
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
        provider_id,
        customer:profiles!bookings_customer_id_fkey (full_name, phone),
        service:services (name)
      `, { count: 'exact' })

    if (status === 'pending') {
      query = query.in('status', ['pending', 'pending_quote'])
    } else if (status === 'unassigned') {
      query = query.is('provider_id', null).in('status', ['confirmed'])
    } else if (status === 'confirmed') {
      query = query.not('provider_id', 'is', null).in('status', ['confirmed', 'provider_assigned', 'in_progress'])
    } else if (status === 'completed') {
      query = query.in('status', ['completed'])
    } else if (status === 'cancelled') {
      query = query.in('status', ['cancelled', 'refunded', 'disputed'])
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data: bookings, count } = await query

    return NextResponse.json({
      success: true,
      data: {
        bookings: bookings ?? [],
        total: count ?? 0,
        page,
        pageSize,
        hasMore: (from + pageSize) < (count ?? 0),
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
