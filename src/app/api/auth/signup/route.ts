import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  prefix: 'everiithing-signup',
})

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function otpEmailHtml(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 24px; color: #1a1a2e; margin-bottom: 8px;">Verify your email</h1>
      <p style="font-size: 16px; color: #666; margin-bottom: 24px;">Enter this code to complete your registration:</p>
      <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #999;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'

    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many signup attempts. Try again later.' } },
        { status: 429 },
      )
    }

    const body = await req.json()
    console.log('Signup request:', { full_name: body.full_name, email: body.email, phone: body.phone })
    let { full_name, phone, email, password } = body

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name, email, and password are required' } },
        { status: 400 },
      )
    }

    const passwordErrors: string[] = []
    if (password.length < 8) passwordErrors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) passwordErrors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) passwordErrors.push('One lowercase letter')
    if (!/[0-9]/.test(password)) passwordErrors.push('One number')
    if (!/[^a-zA-Z0-9]/.test(password)) passwordErrors.push('One special character')
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: `Password must include: ${passwordErrors.join(', ')}` } },
        { status: 400 },
      )
    }

    if (phone) {
      phone = phone.replace(/[\s\-()]/g, '')
      if (phone.startsWith('0')) phone = '+234' + phone.slice(1)
      else if (!phone.startsWith('+')) phone = '+' + phone
    }

    const supabase = createClient()
    const meta: Record<string, string> = { full_name }
    if (phone) meta.phone = phone

    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { data: meta },
    })

    if (sendError) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: sendError.message } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const { error: dbError } = await admin.from('pending_signups').upsert(
      {
        email,
        password: 'stored-in-cookie',
        full_name,
        phone,
      },
      { onConflict: 'email' },
    )

    if (dbError) {
      console.error('Signup error:', JSON.stringify({ message: dbError.message, details: dbError.details, hint: dbError.hint, code: dbError.code }))
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Could not complete registration. Please try again.' } },
        { status: 500 },
      )
    }

    console.log('Key exists:', !!process.env.SIGNUP_ENCRYPTION_KEY)
    const ENCRYPTION_KEY = process.env.SIGNUP_ENCRYPTION_KEY
    if (!ENCRYPTION_KEY) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFIG_ERROR', message: 'Server encryption key not configured' } },
        { status: 500 },
      )
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
    let encrypted = cipher.update(password, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag().toString('hex')
    const encryptedPassword = iv.toString('hex') + ':' + encrypted + ':' + authTag

    const response = NextResponse.json({ success: true, data: { message: 'Verification code sent to your email' } })
    response.cookies.set('signup_password', encryptedPassword, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Signup route error:', err)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err instanceof Error ? err.message : 'Internal server error' } },
      { status: 500 },
    )
  }
}
