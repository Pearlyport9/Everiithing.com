import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateCommission } from '@/utils/payments'

export async function GET() {
  return NextResponse.json({ success: true, data: [] })
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      )
    }

    const { service_id, scheduled_date, scheduled_time, address, lga, notes } = await req.json()

    if (!service_id || !scheduled_date || !scheduled_time || !address || !lga) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const { data: service } = await admin
      .from('services')
      .select('id, base_price_ngn, is_active')
      .eq('id', service_id)
      .single()

    if (!service || !service.is_active) {
      return NextResponse.json(
        { success: false, error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found or inactive' } },
        { status: 400 },
      )
    }

    const txRef = `EVR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const { platformFee, providerPayout } = calculateCommission(service.base_price_ngn)

    const { data: booking, error: insertError } = await admin
      .from('bookings')
      .insert({
        customer_id: user.id,
        service_id: service.id,
        scheduled_date,
        scheduled_time,
        address,
        lga,
        notes: notes || null,
        price_ngn: service.base_price_ngn,
        platform_fee_ngn: platformFee,
        provider_payout_ngn: providerPayout,
        flw_tx_ref: txRef,
        status: 'pending',
        payment_status: 'unpaid',
      })
      .select('id, price_ngn, flw_tx_ref')
      .single()

    if (insertError) {
      console.error('Booking insert failed:', insertError)
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to create booking' } },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        price_ngn: booking.price_ngn,
        flw_tx_ref: booking.flw_tx_ref,
      },
    })
  } catch (err) {
    console.error('Booking API error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
