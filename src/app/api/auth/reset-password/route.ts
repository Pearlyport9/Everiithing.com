import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'New password is required' } },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' } },
        { status: 400 },
      )
    }

    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      )
    }

    const admin = createAdminClient()

    const { error: updateError } = await admin.auth.admin.updateUserById(
      user.id,
      { password },
    )

    if (updateError) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_ERROR', message: updateError.message } },
        { status: 400 },
      )
    }

    await supabase.auth.signOut()

    return NextResponse.json({ success: true, data: { message: 'Password updated successfully' } })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
