import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logPayment } from '@/lib/paymentLogger'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 },
      )
    }

    const { id } = await params
    const { action } = await req.json()

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Action must be "accept" or "reject"' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const { data: booking } = await admin
      .from('bookings')
      .select('id, customer_id, status, quoted_total_ngn, topup_owed_ngn, price_ngn')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      )
    }

    if (booking.customer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'This booking does not belong to you' } },
        { status: 403 },
      )
    }

    if (booking.status !== 'pending_quote') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'This booking is not awaiting a quote response' } },
        { status: 400 },
      )
    }

    if (!booking.quoted_total_ngn) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_QUOTE', message: 'No quote has been sent for this booking yet' } },
        { status: 400 },
      )
    }

    if (action === 'reject') {
      const { error: updateError } = await admin
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) {
        console.error('Failed to reject quote:', updateError)
        return NextResponse.json(
          { success: false, error: { code: 'DB_ERROR', message: 'Failed to reject quote' } },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        data: { status: 'cancelled' },
      })
    }

    const topupOwed = booking.topup_owed_ngn ?? 0

    if (topupOwed > 0) {
      const topupTxRef = `EVR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

      logPayment({
        booking_id: id,
        flw_tx_ref: topupTxRef,
        event_type: 'topup_initiated',
        status: 'initiated',
        expected_amount: topupOwed,
      })

      return NextResponse.json({
        success: true,
        data: {
          requires_payment: true,
          tx_ref: topupTxRef,
          amount: topupOwed,
        },
      })
    }

    const newPaymentStatus = booking.price_ngn > 0 ? 'in_escrow' : 'paid'

    const { error: updateError } = await admin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to accept quote:', updateError)
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to accept quote' } },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { requires_payment: false, status: 'confirmed' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR'
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
