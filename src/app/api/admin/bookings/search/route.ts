import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin'

export async function GET(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await requireAdmin(user?.id)

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const admin = createAdminClient()

    const { data } = await admin
      .from('bookings')
      .select('id')
      .or(`service_name.ilike.%${q}%,id.ilike.%${q}%`)
      .limit(10)

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
