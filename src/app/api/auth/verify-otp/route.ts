import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  prefix: 'everiithing-verify-otp',
})

export async function POST(req: Request) {
  try {
    const { email, code: otp, type } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and code are required' } },
        { status: 400 },
      )
    }

    const { success } = await ratelimit.limit(email)
    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many verification attempts. Try again later.' } },
        { status: 429 },
      )
    }
    const supabase = createClient()

    const { data: verifyData, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error || !verifyData.session) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: error?.message || 'Invalid or expired code' } },
        { status: 401 },
      )
    }

    let session = verifyData.session
    const userId = session.user.id

    if (type === 'password_reset') {
      return NextResponse.json({
        success: true,
        data: { user_id: userId, message: 'Email verified' },
      })
    }

    const admin = createAdminClient()

    const { data: pending } = await admin
      .from('pending_signups')
      .select('full_name, phone')
      .eq('email', email)
      .single()

    const fullName = pending?.full_name || (session.user.user_metadata?.full_name as string | undefined)
    const phone = pending?.phone || (session.user.user_metadata?.phone as string | undefined)

    const cookieStore = await cookies()
    const encryptedPassword = cookieStore.get('signup_password')?.value

    if (encryptedPassword) {
      const ENCRYPTION_KEY = process.env.SIGNUP_ENCRYPTION_KEY
      if (ENCRYPTION_KEY) {
        try {
          const parts = encryptedPassword.split(':')
          const iv = Buffer.from(parts[0], 'hex')
          const encrypted = parts[1]
          const authTag = Buffer.from(parts[2], 'hex')

          const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
          decipher.setAuthTag(authTag)
          let decrypted = decipher.update(encrypted, 'hex', 'utf8')
          decrypted += decipher.final('utf8')

          const { error: pwdError } = await admin.auth.admin.updateUserById(userId, { password: decrypted })
          if (pwdError) {
            console.error('Failed to set password:', pwdError)
          }

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: decrypted,
          })

          if (!signInError && signInData?.session) {
            session = signInData.session
          }
        } catch (decryptErr) {
          console.error('Failed to decrypt password cookie:', decryptErr)
        }
      }
    }

    await admin.from('pending_signups').delete().eq('email', email)

    if (phone) {
      await admin.auth.admin.updateUserById(userId, { phone, phone_confirm: true })
    }

    await supabase.from('profiles').upsert({
      id: userId,
      role: 'customer',
      full_name: fullName || null,
      phone: phone || null,
      email: email,
      is_active: true,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        message: 'Email verified',
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    })

    if (encryptedPassword) {
      response.cookies.set('signup_password', '', { maxAge: 0, path: '/' })
    }

    return response
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
