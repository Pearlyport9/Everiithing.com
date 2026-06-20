import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const { id } = await params
    const { verification_status } = await req.json()

    const validStatuses = ['pending', 'approved', 'rejected']
    if (!validStatuses.includes(verification_status)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid verification status' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    const updateData: Record<string, unknown> = {
      verification_status,
    }
    if (verification_status === 'approved') {
      updateData.verified_at = new Date().toISOString()
    } else {
      updateData.verified_at = null
    }

    const { error } = await admin
      .from('providers')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, error: { code: 'DB_ERROR', message: 'Failed to update provider' } },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
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
