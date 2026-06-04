# Everiithing•com — Payments

## Platform: Flutterwave

---

## Payment Model
Everiithing uses an **escrow model**:
1. Customer pays upfront at booking
2. Funds held in escrow by platform
3. Funds released to provider only when customer confirms job complete
4. Platform retains 15–20% commission before releasing payout

---

## Payment Methods Supported
- Debit/Credit Card
- Bank Transfer
- USSD
- Mobile Money (future)

---

## Booking Payment Flow

```
Customer confirms booking
        ↓
Flutterwave payment modal opens
        ↓
Customer pays full amount
        ↓
Flutterwave webhook → our API confirms payment
        ↓
booking.payment_status = 'in_escrow'
booking.status = 'confirmed'
        ↓
Provider assigned + notified via SMS
        ↓
Job completed → customer marks complete
        ↓
booking.status = 'completed'
booking.payment_status = 'released'
        ↓
Provider payout triggered (minus commission)
providers.available_balance += provider_payout_ngn
```

---

## Commission Calculation

```typescript
// utils/payments.ts
export function calculateCommission(priceNgn: number) {
  const COMMISSION_RATE = 0.18  // 18% flat for MVP

  const commission = Math.round(priceNgn * COMMISSION_RATE)
  const providerPayout = priceNgn - commission

  return {
    totalPrice: priceNgn,
    platformFee: commission,
    providerPayout,
  }
}
```

---

## Flutterwave Integration

### Initialise Payment
```typescript
// lib/flutterwave/initPayment.ts
export async function initiatePayment({
  bookingId,
  amount,
  customerEmail,
  customerName,
  customerPhone,
}: PaymentPayload) {
  const txRef = `EVR-${bookingId}-${Date.now()}`

  const payload = {
    tx_ref: txRef,
    amount,
    currency: 'NGN',
    redirect_url: `${process.env.NEXT_PUBLIC_URL}/booking/verify`,
    customer: {
      email: customerEmail,
      name: customerName,
      phonenumber: customerPhone,
    },
    customizations: {
      title: 'Everiithing•com',
      description: 'Home Service Booking',
      logo: process.env.NEXT_PUBLIC_LOGO_URL,
    },
  }

  const res = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  return data.data.link   // redirect customer to this URL
}
```

### Verify Payment (Webhook)
```typescript
// app/api/webhooks/flutterwave/route.ts
export async function POST(req: Request) {
  const signature = req.headers.get('verif-hash')

  // Validate webhook signature
  if (signature !== process.env.FLW_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await req.json()

  if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
    const txRef = payload.data.tx_ref

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'in_escrow', flw_tx_ref: txRef })
      .eq('flw_tx_ref', txRef)

    // Notify provider via SMS
    await sendSMS({ ... })
  }

  return new Response('OK', { status: 200 })
}
```

---

## Provider Payout Flow

```typescript
// lib/flutterwave/payout.ts
export async function triggerProviderPayout(providerId: string, amountNgn: number) {
  const provider = await getProviderBankDetails(providerId)

  const res = await fetch('https://api.flutterwave.com/v3/transfers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      account_bank: provider.bank_code,
      account_number: provider.account_number,
      amount: amountNgn,
      currency: 'NGN',
      reference: `PAYOUT-${providerId}-${Date.now()}`,
      narration: 'Everiithing Job Payout',
    }),
  })

  return await res.json()
}
```

---

## Environment Variables

```env
FLW_PUBLIC_KEY=
FLW_SECRET_KEY=
FLW_WEBHOOK_SECRET=
```

---

## Refund Policy (MVP)
- Full refund if provider no-show
- Partial refund (50%) if job started but disputed
- No refund after customer marks job complete
- All refunds processed manually via admin panel in MVP
