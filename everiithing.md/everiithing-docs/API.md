# Everiithing•com — API Routes

## Base: Next.js API Routes (`/app/api/`)

All routes return JSON. All protected routes require a valid Supabase session cookie.

---

## Auth Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/send-otp` | Send OTP to phone | Public |
| POST | `/api/auth/verify-otp` | Verify OTP and create session | Public |
| POST | `/api/auth/logout` | Destroy session | Protected |

---

## Booking Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/bookings` | List customer's bookings | Customer |
| POST | `/api/bookings` | Create new booking | Customer |
| GET | `/api/bookings/[id]` | Get booking detail | Owner |
| PATCH | `/api/bookings/[id]/complete` | Mark job as complete | Customer |
| PATCH | `/api/bookings/[id]/cancel` | Cancel booking | Customer |
| POST | `/api/bookings/[id]/dispute` | Raise a dispute | Customer |

---

## Provider Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/providers` | List verified providers (public) | Public |
| GET | `/api/providers/[id]` | Provider public profile | Public |
| GET | `/api/providers/me` | My provider profile | Provider |
| PATCH | `/api/providers/me` | Update provider profile | Provider |
| GET | `/api/providers/me/jobs` | My assigned jobs | Provider |
| PATCH | `/api/providers/me/jobs/[id]/accept` | Accept a job | Provider |
| GET | `/api/providers/me/earnings` | Earnings summary | Provider |
| POST | `/api/providers/me/payout` | Request payout | Provider |

---

## Services Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/services` | All service categories | Public |
| GET | `/api/services/[slug]` | Category + sub-services | Public |

---

## Payment Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/payments/initiate` | Initiate Flutterwave payment | Customer |
| GET | `/api/payments/verify/[txRef]` | Verify payment status | Customer |
| POST | `/api/webhooks/flutterwave` | Flutterwave webhook handler | Signed |

---

## Admin Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/providers` | All providers | Admin |
| PATCH | `/api/admin/providers/[id]/approve` | Approve provider | Admin |
| PATCH | `/api/admin/providers/[id]/reject` | Reject provider | Admin |
| PATCH | `/api/admin/providers/[id]/suspend` | Suspend provider | Admin |
| GET | `/api/admin/bookings` | All bookings | Admin |
| GET | `/api/admin/disputes` | All disputes | Admin |
| PATCH | `/api/admin/disputes/[id]/resolve` | Resolve dispute | Admin |
| GET | `/api/admin/analytics` | Platform analytics | Admin |

---

## Notification Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/notifications` | User's notifications | Protected |
| PATCH | `/api/notifications/[id]/read` | Mark as read | Protected |

---

## Example: Create Booking

### Request
```typescript
POST /api/bookings
Authorization: Bearer <supabase_session>

{
  "serviceId": "uuid",
  "scheduledDate": "2025-08-15",
  "scheduledTime": "10:00",
  "address": "14 Admiralty Way, Lekki Phase 1",
  "lga": "Eti-Osa",
  "notes": "The socket is in the master bedroom"
}
```

### Response
```typescript
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "pending",
    "paymentLink": "https://checkout.flutterwave.com/...",
    "totalAmountNgn": 15000
  }
}
```

---

## Error Format

All errors follow this shape:
```typescript
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Provider is not available at this time."
  }
}
```

### Common Error Codes
| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | No valid session |
| `FORBIDDEN` | Wrong role for this action |
| `NOT_FOUND` | Resource doesn't exist |
| `VALIDATION_ERROR` | Invalid input |
| `BOOKING_CONFLICT` | Provider unavailable |
| `PAYMENT_FAILED` | Flutterwave payment error |
| `PROVIDER_NOT_VERIFIED` | Provider not yet approved |
