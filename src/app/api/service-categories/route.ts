import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('service_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch {
    return NextResponse.json({ success: false, data: [] })
  }
}
