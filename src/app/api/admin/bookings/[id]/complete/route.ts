import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const { id } = await params

    const admin = createAdminClient()

    const { data: booking } = await admin
      .from('bookings')
      .select('id, status, quoted_total_ngn, topup_owed_ngn')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      )
    }

    if (!['provider_assigned', 'in_progress'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Only assigned or in-progress bookings can be marked complete' } },
        { status: 400 },
      )
    }

    if (!booking.quoted_total_ngn) {
      return NextResponse.json(
        { success: false, error: { code: 'QUOTE_REQUIRED', message: 'A quote must be sent before marking this booking as complete.' } },
        { status: 400 },
      )
    }

    if ((booking.topup_owed_ngn ?? 0) > 0) {
      if (booking.status === 'pending_quote') {
        return NextResponse.json(
          { success: false, error: { code: 'TOPUP_UNPAID', message: 'The top-up payment must be settled before marking this booking as complete.' } },
          { status: 400 },
        )
      }
    }

    const { error: updateError } = await admin
      .from('bookings')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to mark booking complete:', updateError)
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to mark booking as complete' } },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data: { status: 'completed' } })
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
