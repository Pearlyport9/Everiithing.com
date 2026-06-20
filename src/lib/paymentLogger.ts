import { createAdminClient } from '@/lib/supabase/admin'

interface PaymentLogInput {
  booking_id?: string | null
  flw_tx_ref?: string | null
  flw_transaction_id?: string | null
  event_type: string
  status: string
  expected_amount?: number | null
  paid_amount?: number | null
  currency?: string
  raw_payload?: Record<string, unknown> | null
  error_message?: string | null
}

export async function logPayment(input: PaymentLogInput) {
  try {
    const admin = createAdminClient()
    await admin.from('payment_logs').insert({
      booking_id: input.booking_id ?? null,
      flw_tx_ref: input.flw_tx_ref ?? null,
      flw_transaction_id: input.flw_transaction_id ?? null,
      event_type: input.event_type,
      status: input.status,
      expected_amount: input.expected_amount ?? null,
      paid_amount: input.paid_amount ?? null,
      currency: input.currency ?? 'NGN',
      raw_payload: input.raw_payload ? JSON.parse(JSON.stringify(input.raw_payload)) : null,
      error_message: input.error_message ?? null,
    })
  } catch (err) {
    console.error('payment_log insert failed (non-blocking):', err)
  }
}
