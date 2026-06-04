import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    return NextResponse.json({
      success: true,
      data: {
        link: 'https://checkout.flutterwave.com/mock',
        txRef: `EVR-${body.bookingId}-${Date.now()}`,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
