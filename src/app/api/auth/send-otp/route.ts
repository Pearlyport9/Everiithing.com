import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Phone number is required' } },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true, data: { message: 'OTP sent' } })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
