// Usage: node scripts/test-flw-webhook.mjs <tx_ref> [transaction_id]
//
//   <tx_ref>         — flw_tx_ref from a pending booking (required)
//   [transaction_id] — Flutterwave transaction ID from dashboard (optional)
//                      If omitted, a mock ID is used and verification is skipped
//                      (works only when FLW_SKIP_VERIFY=true in .env.local)

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/flutterwave'
const WEBHOOK_SECRET = process.env.FLW_WEBHOOK_SECRET || 'test-local-secret'

const txRef = process.argv[2]
const transactionId = process.argv[3]

if (!txRef) {
  console.error('Usage: node scripts/test-flw-webhook.mjs <tx_ref> [transaction_id]')
  console.error('')
  console.error('  Get a pending booking tx_ref from Supabase:')
  console.error('    SELECT flw_tx_ref FROM bookings WHERE status = \x27pending\x27 AND flw_tx_ref IS NOT NULL LIMIT 1;')
  process.exit(1)
}

const payload = {
  event: 'charge.completed',
  data: {
    id: transactionId ? Number(transactionId) : 999999999,
    tx_ref: txRef,
    status: 'successful',
    amount: 5000,
    currency: 'NGN',
    customer: { email: 'test@example.com', name: 'Test User' },
  },
}

async function main() {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'verif-hash': WEBHOOK_SECRET,
        ...(transactionId ? {} : { 'x-test-mode': 'true' }),
      },
      body: JSON.stringify(payload),
    })

    const body = await res.text()
    console.log(`Status: ${res.status}`)
    console.log(`Response: ${body}`)
  } catch (err) {
    console.error('Request failed:', err.message)
  }
}

main()
