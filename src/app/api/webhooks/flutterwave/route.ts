import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logPayment } from '@/lib/paymentLogger'

interface FlwData {
  id: number
  tx_ref: string
  status: string
  amount: number
  currency: string
  customer?: { email: string; name: string }
}

interface FlwPayload {
  event: string
  data: FlwData
}

async function verifyWithFlutterwave(transactionId: number): Promise<{
  status: string
  data?: { status: string; amount: number; currency: string; tx_ref: string }
}> {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    },
  )
  return res.json()
}

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('verif-hash')

    if (signature !== process.env.FLW_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const payload: FlwPayload = await req.json()

    if (payload.event !== 'charge.completed') {
      return NextResponse.json({ status: 'ignored' })
    }

    if (payload.data.status !== 'successful') {
      return NextResponse.json({ status: 'ignored' })
    }

    const { tx_ref, id: transactionId } = payload.data

    if (!tx_ref || !transactionId) {
      console.error('FLW webhook: missing tx_ref or transaction_id')
      return NextResponse.json({ status: 'ignored' })
    }

    logPayment({
      flw_tx_ref: tx_ref,
      flw_transaction_id: String(transactionId),
      event_type: 'webhook_received',
      status: 'received',
      raw_payload: payload as unknown as Record<string, unknown>,
    })

    const isTestMode = req.headers.get('x-test-mode') === 'true' && process.env.NODE_ENV === 'development'
    let verificationData: { amount?: number; currency?: string } | null = null

    if (isTestMode) {
      console.log('FLW webhook: test mode — skipping server-side verification')
      logPayment({
        flw_tx_ref: tx_ref,
        flw_transaction_id: String(transactionId),
        event_type: 'verification_skipped',
        status: 'success',
      })
    } else {
      const verification = await verifyWithFlutterwave(transactionId)
      const verified = verification.status === 'success' && verification.data?.status === 'successful'
      verificationData = verification.data ?? null

      if (!verified) {
        logPayment({
          flw_tx_ref: tx_ref,
          flw_transaction_id: String(transactionId),
          event_type: 'verification_failed',
          status: 'failed',
          paid_amount: verification.data?.amount ?? null,
          currency: verification.data?.currency ?? 'NGN',
          raw_payload: verification as unknown as Record<string, unknown>,
          error_message: 'Flutterwave verification returned non-successful status',
        })
        return NextResponse.json({ status: 'verification_failed' })
      }

      logPayment({
        flw_tx_ref: tx_ref,
        flw_transaction_id: String(transactionId),
        event_type: 'verification_succeeded',
        status: 'success',
        paid_amount: verification.data?.amount ?? null,
        currency: verification.data?.currency ?? 'NGN',
        raw_payload: verification as unknown as Record<string, unknown>,
      })
    }

    const admin = createAdminClient()

    const { data: booking } = await admin
      .from('bookings')
      .select('id, price_ngn, status, payment_status')
      .eq('flw_tx_ref', tx_ref)
      .single()

    if (!booking) {
      logPayment({
        flw_tx_ref: tx_ref,
        flw_transaction_id: String(transactionId),
        event_type: 'booking_not_found',
        status: 'failed',
        error_message: 'No booking found matching this transaction reference',
      })
      return NextResponse.json({ status: 'not_found' })
    }

    if (booking.status === 'confirmed') {
      logPayment({
        booking_id: booking.id,
        flw_tx_ref: tx_ref,
        flw_transaction_id: String(transactionId),
        event_type: 'booking_already_confirmed',
        status: 'success',
        expected_amount: booking.price_ngn,
        paid_amount: verificationData?.amount ?? null,
        currency: verificationData?.currency ?? 'NGN',
      })
      return NextResponse.json({ status: 'already_processed' })
    }

    const paidAmount = verificationData?.amount ?? null

    if (paidAmount !== null && paidAmount < booking.price_ngn) {
      logPayment({
        booking_id: booking.id,
        flw_tx_ref: tx_ref,
        flw_transaction_id: String(transactionId),
        event_type: 'amount_mismatch',
        status: 'failed',
        expected_amount: booking.price_ngn,
        paid_amount: paidAmount,
        currency: verificationData?.currency ?? 'NGN',
        error_message: `Underpayment: paid ${paidAmount}, expected ${booking.price_ngn}`,
      })
      return NextResponse.json({ status: 'amount_mismatch' })
    }

    if (paidAmount !== null && paidAmount > booking.price_ngn) {
      logPayment({
        booking_id: booking.id,
        flw_tx_ref: tx_ref,
        flw_transaction_id: String(transactionId),
        event_type: 'overpayment_detected',
        status: 'success',
        expected_amount: booking.price_ngn,
        paid_amount: paidAmount,
        currency: verificationData?.currency ?? 'NGN',
        error_message: `Overpayment: paid ${paidAmount}, expected ${booking.price_ngn}`,
      })
    }

    const { error: updateError } = await admin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'in_escrow',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    if (updateError) {
      console.error('FLW webhook: failed to update booking', updateError)
      return NextResponse.json({ status: 'update_failed' })
    }

    logPayment({
      booking_id: booking.id,
      flw_tx_ref: tx_ref,
      flw_transaction_id: String(transactionId),
      event_type: 'booking_confirmed',
      status: 'success',
      expected_amount: booking.price_ngn,
      paid_amount: paidAmount,
      currency: verificationData?.currency ?? 'NGN',
    })

    return NextResponse.json({ status: 'success' })
  } catch (err) {
    console.error('FLW webhook error:', err)
    return NextResponse.json({ status: 'error' })
  }
}
