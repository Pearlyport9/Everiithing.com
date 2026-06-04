# Everiithing•com — Notifications

## Channels
- **SMS**: Termii (primary — Nigerian delivery)
- **Email**: Resend (secondary — booking receipts, verification)
- **In-app**: Supabase realtime notifications table

---

## SMS Templates (Termii)

### Customer: Booking Confirmed
```
Everiithing•com: Your booking is confirmed!
Service: {{service_name}}
Date: {{date}} at {{time}}
Address: {{address}}
A verified provider will be assigned shortly.
Questions? Reply HELP.
```

### Customer: Provider Assigned
```
Everiithing•com: Your provider has been assigned.
Provider: {{provider_name}} (⭐ {{rating}})
Arriving: {{date}} at {{time}}
Track your job at: everiithing.com/booking/{{booking_id}}
```

### Customer: Job Complete — Rate Your Provider
```
Everiithing•com: Job done! How was {{provider_name}}?
Rate your experience: everiithing.com/review/{{booking_id}}
Your feedback keeps our platform trusted.
```

### Customer: OTP
```
Your Everiithing•com verification code is: {{otp}}
Expires in 10 minutes. Do not share this code.
```

### Provider: New Job Assigned
```
Everiithing•com: New job for you!
Service: {{service_name}}
Date: {{date}} at {{time}}
Location: {{lga}}
Log in to accept: everiithing.com/provider/jobs
```

### Provider: Payout Processed
```
Everiithing•com: Payout sent!
Amount: ₦{{amount}}
Job: {{service_name}} on {{date}}
Should arrive in your account within 24 hours.
```

### Provider: Application Received
```
Everiithing•com: We've received your application!
We'll review your documents and be in touch within 48 hours.
Questions? Call us: {{ops_phone}}
```

### Provider: Application Approved
```
Congratulations! Your Everiithing•com profile is now LIVE.
You are a verified provider. 🎉
Log in to start receiving jobs: everiithing.com/provider
```

### Provider: Application Rejected
```
Everiithing•com: Unfortunately your application was not successful.
Reason: {{reason}}
You may reapply after 30 days.
Questions? Email: providers@everiithing.com
```

---

## Email Templates (Resend)

### Booking Confirmation Email
**Subject:** Your booking is confirmed — {{service_name}}

**Body:**
- Booking ID
- Service details
- Date, time, address
- Provider name (once assigned)
- Price paid
- What happens next
- Contact support link

### Verification Stage Update
**Subject:** Your Everiithing application — update

**Body:**
- Current stage
- What was passed
- Next step and what to expect
- Timeline

---

## In-App Notification Types

| Type | Trigger | Audience |
|------|---------|----------|
| `booking_confirmed` | Payment successful | Customer |
| `provider_assigned` | Ops assigns provider | Customer |
| `job_completed` | Customer marks complete | Provider |
| `payout_processed` | Payout triggered | Provider |
| `dispute_raised` | Customer raises dispute | Provider + Admin |
| `dispute_resolved` | Admin resolves dispute | Customer + Provider |
| `verification_update` | Stage passed or failed | Provider |
| `new_review` | Customer leaves review | Provider |

---

## Integration Code

### Send SMS via Termii
```typescript
// lib/termii/sendSMS.ts
export async function sendSMS({ to, message }: { to: string; message: string }) {
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
```

### Send Email via Resend
```typescript
// lib/resend/sendEmail.ts
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({ to, subject, html }: EmailPayload) {
  return resend.emails.send({
    from: 'Everiithing <hello@everiithing.com>',
    to,
    subject,
    html,
  })
}
```

---

## Environment Variables
```env
TERMII_API_KEY=
RESEND_API_KEY=
```
