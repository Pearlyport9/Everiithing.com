import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const signature = req.headers.get('verif-hash')

  if (signature !== process.env.FLW_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await req.json()

  if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
    return NextResponse.json({ status: 'ok' })
  }

  return new Response('OK', { status: 200 })
}
