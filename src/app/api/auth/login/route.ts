import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'everiithing-login',
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown'

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } },
        { status: 400 },
      )
    }

    const { success } = await ratelimit.limit(`${email}:${ip}`)
    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts. Try again later.' } },
        { status: 429 },
      )
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: authError.message === 'Invalid login credentials' ? 'Invalid email or password' : authError.message } },
        { status: 401 },
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
