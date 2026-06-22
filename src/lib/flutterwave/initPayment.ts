interface PaymentPayload {
  bookingId: string
  amount: number
  customerEmail: string
  customerName: string
  customerPhone: string
}

export async function initiatePayment(payload: PaymentPayload) {
  const txRef = `EVR-${payload.bookingId}-${Date.now()}`

  const body = {
    tx_ref: txRef,
    amount: payload.amount,
    currency: 'NGN',
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/verify`,
    customer: {
      email: payload.customerEmail,
      name: payload.customerName,
      phonenumber: payload.customerPhone,
    },
    customizations: {
      title: 'Everiithing\u2022com',
      description: 'Home & Office Service Booking',
      logo: process.env.NEXT_PUBLIC_LOGO_URL,
    },
  }

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return data.data?.link as string | undefined
}
