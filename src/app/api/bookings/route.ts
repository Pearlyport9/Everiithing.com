import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, data: [] })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.serviceId || !body.scheduledDate || !body.address) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          bookingId: 'mock-booking-id',
          status: 'pending',
          paymentLink: null,
          totalAmountNgn: 0,
        },
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
