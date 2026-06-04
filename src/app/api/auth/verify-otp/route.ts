import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Phone and OTP are required' } },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { session: { access_token: 'mock_token', user: { id: 'mock_id', phone } } },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 },
    )
  }
}
