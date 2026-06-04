export async function verifyPayment(txRef: string) {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${txRef}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    },
  )
  return res.json()
}
