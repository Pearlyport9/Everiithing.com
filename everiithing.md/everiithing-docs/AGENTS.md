# Everiithing•com — Agent Context (AGENTS.md)

> This file is for AI coding agents (Claude Code, OpenCode, etc.)
> Read this before writing any code for this project.

---

## What This Project Is
A verified home services marketplace for Nigeria. Customers book vetted artisans. The platform manages pricing, quality, and experience end-to-end. MVP targets Lagos.

---

## Tech Stack
- **Framework**: Next.js 14, App Router, TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Payments**: Flutterwave (escrow model)
- **Styling**: Tailwind CSS v3
- **SMS**: Termii
- **Email**: Resend
- **Deployment**: Vercel

---

## Non-Negotiable Rules

### Code
- Always use TypeScript — no `.js` files
- Always use Server Components by default — only add `'use client'` when necessary
- Never use `any` type
- All DB queries go through `lib/supabase/` helpers, not raw fetch
- Always handle errors — no unhandled promise rejections
- Use `next/image` for all images — never `<img>` tags
- Use `next/link` for all internal navigation — never `<a>` tags
- All monetary values stored in **kobo** (integer) — divide by 100 to display NGN

### Supabase
- Always use the server client for sensitive operations
- Always check user session before protected operations
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components
- All tables have RLS enabled — do not disable

### Payments
- Payment amounts are in NGN (naira) to Flutterwave, stored in kobo internally
- Never release provider payout before `booking.status === 'completed'`
- Always verify Flutterwave webhook signature before processing

### UI
- Mobile-first — design for 375px width upward
- Use Cabinet Grotesk for headlines, Satoshi for body
- Primary colour: `#E94560` (accent red) — use sparingly
- Dark background: `#1A1A2E` (navy)
- All prices display with ₦ symbol and comma formatting: ₦15,000

---

## File Structure
```
app/
  (public)/       → Landing, services pages — no auth required
  (auth)/         → Login, signup, OTP
  (customer)/     → Protected customer routes
  (provider)/     → Protected provider routes
  (admin)/        → Protected admin routes
  api/            → All API route handlers
components/
  ui/             → Base components (Button, Input, Badge, Card)
  shared/         → Used across roles
  customer/       → Customer-specific
  provider/       → Provider-specific
  admin/          → Admin-specific
lib/
  supabase/       → client.ts, server.ts, middleware.ts
  flutterwave/    → initPayment.ts, verifyPayment.ts, payout.ts
  termii/         → sendSMS.ts
  resend/         → sendEmail.ts
types/
  index.ts        → All shared TypeScript types
utils/
  formatters.ts   → currency, date, phone formatters
  validators.ts   → form validation helpers
```

---

## Key Types

```typescript
// types/index.ts

type UserRole = 'customer' | 'provider' | 'admin'

type BookingStatus =
  | 'pending' | 'confirmed' | 'provider_assigned'
  | 'in_progress' | 'completed' | 'disputed'
  | 'cancelled' | 'refunded'

type VerificationStatus =
  | 'pending' | 'under_review' | 'interview_scheduled'
  | 'skills_test' | 'approved' | 'rejected' | 'suspended'

type PaymentStatus =
  | 'unpaid' | 'paid' | 'in_escrow' | 'released' | 'refunded'

interface Booking {
  id: string
  customerId: string
  providerId: string
  serviceId: string
  status: BookingStatus
  scheduledDate: string
  scheduledTime: string
  address: string
  lga: string
  priceNgn: number         // stored in kobo
  paymentStatus: PaymentStatus
  flwTxRef: string | null
  createdAt: string
}
```

---

## Common Utilities

```typescript
// utils/formatters.ts

// Format kobo to NGN display
export function formatNGN(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

// Format Nigerian phone (add country code)
export function formatPhone(phone: string): string {
  if (phone.startsWith('0')) return `+234${phone.slice(1)}`
  return phone
}

// Format date for display
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}
```

---

## MVP Service Categories (Slugs)
- `plumbing`
- `electrical`
- `ac-services`
- `generator-inverter`
- `painting`
- `deep-cleaning`
- `carpentry`

---

## What NOT to Build in MVP
- Native iOS/Android app
- Live GPS tracking
- In-app chat
- Provider subscription tiers
- Insurance-backed jobs
- Multi-city rollout beyond Lagos
