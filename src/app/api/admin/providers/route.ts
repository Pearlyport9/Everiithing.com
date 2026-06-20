import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const admin = createAdminClient()

    const { data: providers } = await admin
      .from('providers')
      .select(`
        id,
        full_name,
        phone,
        email,
        verification_status,
        verified_at,
        is_available,
        service_lgas,
        notes,
        created_at,
        provider_categories (
          category:service_categories (id, name, slug)
        )
      `)
      .order('created_at', { ascending: false })

    return NextResponse.json({ success: true, data: providers ?? [] })
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

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const { full_name, phone, email, category_ids, service_lgas, notes } = await req.json()

    if (!full_name || !phone) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name and phone are required' } },
        { status: 400 },
      )
    }

    const admin = createAdminClient()

    // ── 1. Insert provider ──
    const { data: provider, error: providerError } = await admin
      .from('providers')
      .insert({
        full_name,
        phone,
        email: email || null,
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

    // ── 2. Insert category links ──
    if (category_ids?.length > 0) {
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
    }

    return NextResponse.json({ success: true, data: provider })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SERVER_ERROR'
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
    }
    if (message === 'FORBIDDEN') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message } }, { status: 500 })
  }
}
