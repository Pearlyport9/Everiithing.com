import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ success: true, data: [] })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const { data } = await supabase
      .from('bookings')
      .select('id, service_name')
      .eq('customer_id', user.id)
      .ilike('service_name', `%${q}%`)
      .limit(10)

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
