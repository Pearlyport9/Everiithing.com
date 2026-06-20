import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json()

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email/phone and password are required' } },
        { status: 400 },
      )
    }

    const supabase = createClient()

    const isEmail = identifier.includes('@')
    const authPayload = isEmail
      ? { email: identifier, password }
      : { phone: identifier, password }

    const { data, error } = await supabase.auth.signInWithPassword(authPayload)

    if (error) {
      const code = error.message.includes('Invalid login credentials') ? 'INVALID_CREDENTIALS' : 'AUTH_ERROR'
      return NextResponse.json(
        { success: false, error: { code, message: 'Invalid email/phone or password' } },
        { status: 401 },
      )
    }

    return NextResponse.json({ success: true, data: { message: 'Signed in' } })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
