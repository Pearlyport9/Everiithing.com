import sanitizeHtml from 'sanitize-html'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'
import { sendEmail } from '@/lib/nodemailer/sendEmail'

const sanitize = (val: string) => sanitizeHtml(val.trim(), { allowedTags: [], allowedAttributes: {} })

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const { id } = await params
    const { quoted_total_ngn, quote_notes } = await req.json()

    if (quoted_total_ngn == null || quoted_total_ngn < 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Quoted total is required and must be 0 or greater' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const { data: booking } = await admin
      .from('bookings')
      .select('id, price_ngn')
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      )
    }

    const topupOwed = Math.max(0, quoted_total_ngn - booking.price_ngn)

    const { error: updateError } = await admin
      .from('bookings')
      .update({
        quoted_total_ngn,
        quote_notes: quote_notes || null,
        topup_owed_ngn: topupOwed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to save quote:', updateError)
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to save quote' } },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { quoted_total_ngn, quote_notes, topup_owed_ngn: topupOwed },
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

export async function POST(
  req: Request,
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
      .select(`
        id,
        price_ngn,
        quoted_total_ngn,
        quote_notes,
        topup_owed_ngn,
        customer:profiles!bookings_customer_id_fkey (full_name, email),
        service:services (name)
      `)
      .eq('id', id)
      .single()

    if (!booking) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } },
        { status: 404 },
      )
    }

    if (!booking.quoted_total_ngn) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Save a quote before emailing' } },
        { status: 400 },
      )
    }

    const customer = booking.customer as unknown as { full_name?: string; email?: string }
    const serviceName = (booking.service as unknown as { name?: string })?.name || 'Service'
    const customerEmail = customer?.email
    const customerName = customer?.full_name || 'Valued Customer'

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_EMAIL', message: 'Customer has no email address on file' } },
        { status: 400 },
      )
    }

    const calloutFee = booking.price_ngn
    const topupOwed = booking.topup_owed_ngn || 0
    const quotedTotal = booking.quoted_total_ngn

    const formatPrice = (n: number) => `₦${n.toLocaleString('en-NG')}`

    await sendEmail({
      to: customerEmail,
      subject: `Your Quote from Everiithing — ${sanitize(serviceName)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 8px;">Your Service Quote</h1>
          <p style="font-size: 14px; color: #666; margin-bottom: 24px;">${sanitize(serviceName)}</p>

          <p style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            Your assigned provider has assessed the job and provided the following quote.
          </p>

          ${booking.quote_notes ? `
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 13px; font-weight: 600; color: #333; margin: 0 0 6px;">Assessment Notes</p>
              <p style="font-size: 14px; color: #555; margin: 0; line-height: 1.5;">${sanitize(booking.quote_notes)}</p>
            </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #666;">Already paid (call-out fee)</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right; color: #333;">${formatPrice(calloutFee)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #666;">Additional quote amount</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right; color: #333;">${formatPrice(topupOwed)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-size: 16px; font-weight: 700; color: #1a1a2e;">New total</td>
              <td style="padding: 10px 12px; font-size: 16px; font-weight: 700; text-align: right; color: #1a1a2e;">${formatPrice(quotedTotal)}</td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 8px;">
            To proceed, please reply to this email or contact us to approve the quote and arrange the top-up payment.
          </p>
          <p style="font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 24px;">
            Thank you for choosing Everiithing.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 16px;" />
          <p style="font-size: 12px; color: #999; margin: 0;">Everiithing — Home Services, Made Simple</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, data: { message: 'Quote emailed to customer' } })
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
