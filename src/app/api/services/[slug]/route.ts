import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const services: Record<string, unknown> = {
    plumbing: { name: 'Plumbing', slug: 'plumbing', subServices: [{ name: 'Fix a leaky pipe', price: 15000 }, { name: 'Unblock a drain', price: 12000 }] },
    electrical: { name: 'Electrical', slug: 'electrical', subServices: [{ name: 'Replace a socket', price: 8000 }, { name: 'Wiring repair', price: 25000 }] },
  }

  const data = services[params.slug]

  if (!data) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Service category not found' } },
      { status: 404 },
    )
  }

  return NextResponse.json({ success: true, data })
}
