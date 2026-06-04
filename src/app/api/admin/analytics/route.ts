import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalProviders: 0,
      activeBookings: 0,
      pendingVerifications: 0,
      openDisputes: 0,
      totalRevenue: 0,
    },
  })
}
