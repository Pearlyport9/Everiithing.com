import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logPayment } from '@/lib/paymentLogger'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const transactionId = searchParams.get('transaction_id')
    const txRef = searchParams.get('tx_ref')
    const status = searchParams.get('status')

    if (!transactionId || !txRef) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PARAMS', message: 'Missing transaction_id or tx_ref' } },
        { status: 400 },
      )
    }

    if (status === 'cancelled') {
      return NextResponse.json({ success: true, data: { status: 'cancelled' } })
    }

    const admin = createAdminClient()

    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      },
    )

    const verification = await verifyRes.json()

    if (verification.status !== 'success' || verification.data?.status !== 'successful') {
      logPayment({
        flw_tx_ref: txRef,
        flw_transaction_id: String(transactionId),
        event_type: 'verify_page_verification_failed',
        status: 'failed',
        raw_payload: verification as unknown as Record<string, unknown>,
      })
      return NextResponse.json({ success: true, data: { status: 'failed', detail: verification.data?.status ?? 'verification_failed' } })
    }

    const paidAmount = verification.data.amount
    const paidCurrency = verification.data.currency

    const { data: booking } = await admin
      .from('bookings')
      .select('id, price_ngn, status, payment_status, scheduled_date, scheduled_time, service:services(name)')
      .eq('flw_tx_ref', txRef)
      .single()

    if (!booking) {
      logPayment({
        flw_tx_ref: txRef,
        flw_transaction_id: String(transactionId),
        event_type: 'verify_page_booking_not_found',
        status: 'failed',
        error_message: 'No booking found for this tx_ref',
      })
      return NextResponse.json({ success: true, data: { status: 'failed', detail: 'booking_not_found' } })
    }

    if (paidAmount < booking.price_ngn) {
      logPayment({
        booking_id: booking.id,
        flw_tx_ref: txRef,
        flw_transaction_id: String(transactionId),
        event_type: 'verify_page_amount_mismatch',
        status: 'failed',
        expected_amount: booking.price_ngn,
        paid_amount: paidAmount,
        error_message: `Underpayment: paid ${paidAmount}, expected ${booking.price_ngn}`,
      })
      return NextResponse.json({ success: true, data: { status: 'failed', detail: 'amount_mismatch' } })
    }

    logPayment({
      booking_id: booking.id,
      flw_tx_ref: txRef,
      flw_transaction_id: String(transactionId),
      event_type: 'verify_page_verification_succeeded',
      status: 'success',
      expected_amount: booking.price_ngn,
      paid_amount: paidAmount,
      currency: paidCurrency,
    })

    const isConfirmed = booking.status === 'confirmed' && booking.payment_status === 'in_escrow'

    const bookingRow = booking as { service: { name?: string }[] | { name?: string } | null }
    const serviceName = Array.isArray(bookingRow.service) ? bookingRow.service[0]?.name : bookingRow.service?.name

    return NextResponse.json({
      success: true,
      data: {
        status: isConfirmed ? 'confirmed' : 'pending',
        booking: {
          id: booking.id,
          service: serviceName || 'Service',
          scheduled_date: booking.scheduled_date,
          scheduled_time: booking.scheduled_time,
          price_ngn: booking.price_ngn,
        },
      },
    })
  } catch (err) {
    console.error('Booking verify error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
