# Everiithing•com — Project Overview

## What We're Building
A verified, managed home services marketplace for Nigerian households. Customers book vetted artisans. Providers get steady income. The platform controls pricing, quality, and experience end-to-end.

## Core Value Proposition
> "Every provider earned their spot."

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (OTP/phone + email)
- **Payments**: Flutterwave (escrow logic)
- **Storage**: Supabase Storage (provider documents, profile photos)
- **SMS**: Termii
- **Email**: Resend
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel

## Repository Structure
```
everiithing/
├── app/                        # Next.js App Router
│   ├── (public)/               # Landing, services, how it works
│   ├── (auth)/                 # Login, signup, OTP
│   ├── (customer)/             # Customer dashboard
│   ├── (provider)/             # Provider dashboard
│   └── (admin)/                # Admin/ops panel
├── components/
│   ├── ui/                     # Base design system components
│   ├── shared/                 # Shared across roles
│   ├── customer/               # Customer-specific components
│   ├── provider/               # Provider-specific components
│   └── admin/                  # Admin-specific components
├── lib/
│   ├── supabase/               # Supabase client + server configs
│   ├── flutterwave/            # Payment helpers
│   ├── termii/                 # SMS helpers
│   └── resend/                 # Email helpers
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types
├── utils/                      # Utility functions
└── docs/                       # All .md documentation files
```

## MVP Scope
- 7 service categories
- Lagos pilot (5 LGAs)
- Web-first (mobile responsive)
- No native app in MVP

## Key Constraints
- Mobile-first design (most Lagos users on Android)
- Support low-bandwidth (3G) connections
- NDPR compliant data handling
- All prices in NGN (₦)
