import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logPayment } from '@/lib/paymentLogger'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 },
      )
    }

    const body = await req.json()
    await logPayment({
      booking_id: body.booking_id,
      flw_tx_ref: body.flw_tx_ref,
      flw_transaction_id: body.flw_transaction_id,
      event_type: body.event_type,
      status: body.status,
      expected_amount: body.expected_amount,
      paid_amount: body.paid_amount,
      currency: body.currency,
      raw_payload: body.raw_payload,
      error_message: body.error_message,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
