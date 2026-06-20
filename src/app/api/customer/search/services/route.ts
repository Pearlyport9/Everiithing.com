import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') ?? ''

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const admin = createAdminClient()

    const { data } = await admin
      .from('services')
      .select('id, name')
      .ilike('name', `%${q}%`)
      .limit(10)

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch {
    return NextResponse.json({ success: true, data: [] })
  }
}
