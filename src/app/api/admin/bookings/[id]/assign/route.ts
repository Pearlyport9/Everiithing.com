import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const { id } = await params
    const { provider_id } = await req.json()

    if (!provider_id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Provider ID is required' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const { data: provider } = await admin
      .from('providers')
      .select('id, verification_status')
      .eq('id', provider_id)
      .single()

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Provider not found' } },
        { status: 404 },
      )
    }

    if (provider.verification_status !== 'approved') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Only approved providers can be assigned' } },
        { status: 400 },
      )
    }

    const { data: booking } = await admin
      .from('bookings')
      .select('id, status, provider_id')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      )
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Only confirmed bookings can be assigned' } },
        { status: 400 },
      )
    }

    if (booking.provider_id) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_ASSIGNED', message: 'Booking already has a provider assigned' } },
        { status: 400 },
      )
    }

    const { error: updateError } = await admin
      .from('bookings')
      .update({
        provider_id: provider.id,
        status: 'provider_assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to assign provider' } },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR'
    console.error('[api/admin/bookings/assign]', err)
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } }, { status: 500 })
  }
}
