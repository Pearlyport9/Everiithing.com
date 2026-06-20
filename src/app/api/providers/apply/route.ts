import sanitizeHtml from 'sanitize-html'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/nodemailer/sendEmail'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS = 3
const WINDOW_MS = 24 * 60 * 60 * 1000

function sanitize(val: string): string {
  return sanitizeHtml(val.trim(), { allowedTags: [], allowedAttributes: {} })
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const record = rateLimitMap.get(ip)
    if (record && now < record.resetTime) {
      if (record.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { success: false, error: { code: 'RATE_LIMITED', message: 'Too many applications. Try again later.' } },
          { status: 429 },
        )
      }
      record.count++
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    }

    const raw = await req.json()
    const full_name = sanitize(raw.full_name || '')
    const phone = sanitize(raw.phone || '')
    const email = sanitize(raw.email || '')
    const category_ids = Array.isArray(raw.category_ids) ? raw.category_ids.filter((c: unknown) => typeof c === 'string' || typeof c === 'number') : []
    const service_lgas = Array.isArray(raw.service_lgas) ? raw.service_lgas.map((l: unknown) => sanitize(String(l))).filter(Boolean) : []
    const notes = raw.notes ? sanitize(String(raw.notes)) : ''

    if (!full_name || !phone || !email) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name, phone, and email are required' } },
        { status: 400 },
      )
    }

    if (!category_ids?.length) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'At least one service category is required' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const { data: provider, error: providerError } = await admin
      .from('providers')
      .insert({
        full_name,
        phone,
        email,
        service_lgas: service_lgas?.length ? service_lgas : null,
        notes: notes || null,
        verification_status: 'pending',
        is_available: true,
      })
      .select()
      .single()

    if (providerError) {
      return NextResponse.json(
        { success: false, error: { code: 'PROVIDER_INSERT_FAILED', message: providerError.message } },
        { status: 500 },
      )
    }

    const catRows = category_ids.map((catId: string) => ({
      provider_id: provider.id,
      category_id: catId,
    }))
    const { error: catError } = await admin.from('provider_categories').insert(catRows)

    if (catError) {
      return NextResponse.json(
        { success: false, error: { code: 'CATEGORIES_INSERT_FAILED', message: catError.message } },
        { status: 500 },
      )
    }

    try {
      const { data: cats } = await admin
        .from('service_categories')
        .select('name')
        .in('id', category_ids)

      const categoryNames = sanitize(cats?.map((c) => c.name).join(', ') || 'N/A')

      await sendEmail({
        to: process.env.EMAIL_USER || '',
        subject: `New Provider Application — ${full_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="font-size: 22px; color: #1a1a2e; margin-bottom: 16px;">New Provider Application</h1>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee;">${full_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee;">${phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Service Categories:</strong></td><td style="padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee;">${categoryNames}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Notes:</strong></td><td style="padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee;">${notes || 'None provided'}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;"><strong>Submitted at:</strong></td><td style="padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td></tr>
            </table>
            <p style="margin: 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/providers" style="display: inline-block; background: #1a6d4c; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">Review in Admin Panel</a>
            </p>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Failed to send provider application email:', emailErr)
    }

    return NextResponse.json({ success: true, data: provider })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR'
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 },
    )
  }
}
