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

    const [
      { count: totalProviders },
      { count: pendingVerifications },
      { count: activeBookings },
      { count: openDisputes },
      { data: revenueData },
    ] = await Promise.all([
      admin.from('providers').select('*', { count: 'exact', head: true }),
      admin.from('providers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      admin.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'provider_assigned', 'in_progress']),
      admin.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      admin.from('bookings').select('price_ngn').in('payment_status', ['released', 'paid']),
    ])

    const totalRevenue = (revenueData ?? []).reduce((sum, b) => sum + (b.price_ngn ?? 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        totalProviders: totalProviders ?? 0,
        pendingVerifications: pendingVerifications ?? 0,
        activeBookings: activeBookings ?? 0,
        openDisputes: openDisputes ?? 0,
        totalRevenue,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR'
    console.error('[api/admin/analytics]', err)
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
