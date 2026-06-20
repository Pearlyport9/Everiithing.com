import sanitizeHtml from 'sanitize-html'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/nodemailer/sendEmail'

const sanitize = (val: string) => sanitizeHtml(val.trim(), { allowedTags: [], allowedAttributes: {} })

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { description, preferred_date, preferred_time, address, lga } = body

    if (!description || !preferred_date || !preferred_time || !address || !lga) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Description, preferred date/time, address, and LGA are required' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    const customerName = profile?.full_name || user.email || 'Customer'

    const { error: insertError } = await admin
      .from('bookings')
      .insert({
        customer_id: user.id,
        service_id: null,
        status: 'pending_quote',
        payment_status: 'unpaid',
        scheduled_date: preferred_date,
        scheduled_time: preferred_time,
        address,
        lga,
        notes: description,
        price_ngn: 0,
      })

    if (insertError) {
      console.error('Failed to insert quote booking:', insertError)
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to save your request' } },
        { status: 500 },
      )
    }

    const opsEmail = process.env.ADMIN_EMAIL || process.env.OPS_EMAIL || process.env.EMAIL_USER || 'admin@everiithing.com'

    try {
      const formattedDate = new Date(preferred_date).toLocaleDateString('en-NG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })

      await sendEmail({
        to: opsEmail,
        subject: `New Quote Request — ${customerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 16px;">New Quote Request</h1>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Customer</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(customerName)}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Email</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(user.email || 'N/A')}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Phone</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(profile?.phone || 'N/A')}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Description</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(description)}</td></tr>

              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Preferred Date</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(formattedDate)}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Preferred Time</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(preferred_time)}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">Address</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(address)}</td></tr>
              <tr><td style="padding: 8px 12px; font-weight: 600; color: #333; border-bottom: 1px solid #eee;">LGA</td><td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${sanitize(lga)}</td></tr>
            </table>
            <p style="font-size: 14px; color: #999;">This request was submitted via the booking form. Follow up with the customer to agree on a price.</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send quote email notification:', emailError)
    }

    return NextResponse.json(
      { success: true, data: { message: 'Your request has been submitted' } },
      { status: 201 },
    )
  } catch (err) {
    console.error('Quote booking route error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err instanceof Error ? err.message : 'Internal server error' } },
      { status: 500 },
    )
  }
}
