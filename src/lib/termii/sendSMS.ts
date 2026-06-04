export async function sendSMS({
  to,
  message,
}: {
  to: string
  message: string
}) {
  const res = await fetch('https://api.ng.termii.com/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      from: 'Everiithing',
      sms: message,
      type: 'plain',
      channel: 'generic',
      api_key: process.env.TERMII_API_KEY,
    }),
  })
  return res.json()
}
