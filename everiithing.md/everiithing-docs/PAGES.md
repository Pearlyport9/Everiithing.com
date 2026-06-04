# Everiithing•com — Page Specifications

## Route Map

```
/                          → Landing Page (Home)
/services                  → All Services
/services/[slug]           → Individual Service Category
/how-it-works              → How It Works
/become-a-provider         → Provider Recruitment

/login                     → Customer/Provider Login
/signup                    → Customer Sign Up
/signup/provider           → Provider Multi-Step Onboarding
/verify                    → OTP Verification

/dashboard                 → Customer Dashboard (redirect based on role)
/dashboard/bookings        → My Bookings
/dashboard/book            → New Booking Flow
/dashboard/profile         → Customer Profile

/provider/dashboard        → Provider Home
/provider/jobs             → Available + Assigned Jobs
/provider/jobs/[id]        → Job Detail
/provider/earnings         → Earnings & Payouts
/provider/profile          → Provider Profile

/admin                     → Admin Dashboard
/admin/providers           → Provider Management
/admin/verification        → Verification Queue
/admin/bookings            → All Bookings
/admin/disputes            → Disputes
/admin/pricing             → Pricing Management
```

---

## Page Specs

---

### `/` — Landing Page

**Sections (in order):**
1. Nav
2. Hero — headline, subheadline, 2 CTAs, 5 metrics, 6-image mosaic
3. Trust Bar — "Trusted by homeowners across Lagos" + LGA names
4. Services — 7 category cards (horizontal scroll)
5. How It Works — 3 steps
6. Why Choose Us — image + 4 checkpoints (inspo: FullSizeRender layout)
7. Testimonials — 3 cards carousel
8. CTA Banner — "Stop Gambling With Your Home" + 2 buttons
9. Footer

**Meta:**
- Title: "Everiithing•com — Verified Home Services in Lagos"
- Description: "Book trusted plumbers, electricians, AC technicians and more. Verified providers, transparent pricing, satisfaction guaranteed."

---

### `/services/[slug]` — Service Category Page

**Sections:**
1. Nav
2. Hero — category name, description, "Book Now" CTA
3. What's Included — list of sub-services with prices
4. How It Works (abbreviated — 3 steps)
5. Available Providers — grid of verified provider cards in this category
6. Testimonials — filtered to this category
7. CTA Banner
8. Footer

**Dynamic data:** Fetched from `service_categories` + `services` tables by slug

---

### `/dashboard/book` — New Booking Flow

**Multi-step form:**
```
Step 1: Select Service Category + Sub-service
Step 2: Pick Date & Time
Step 3: Enter Address + Notes
Step 4: Review & Pay (Flutterwave modal)
Step 5: Confirmation screen
```

**Validation:**
- Date: not in the past, minimum 24hrs notice
- Address: required, minimum 10 characters
- Payment: must complete before booking is confirmed

---

### `/signup/provider` — Provider Onboarding

**Multi-step form:**
```
Step 1: Phone number + OTP verification
Step 2: Personal info (name, LGA, years experience)
Step 3: Select service categories
Step 4: Upload documents (NIN, ID, certificate)
Step 5: Guarantor details (name, phone, relationship)
Step 6: Completion screen — "We'll review your application within 48 hours"
```

---

### `/provider/dashboard` — Provider Home

**Components:**
- Verification status banner (if not yet approved)
- Earnings summary card (pending, available, total)
- Upcoming jobs list (next 3)
- Quick stats: rating, total jobs, response rate
- CTA: "View All Jobs"

---

### `/admin/verification` — Verification Queue

**Table columns:**
- Provider name
- Phone
- Categories applied for
- Date applied
- Verification stage
- Actions: View Documents, Schedule Interview, Approve, Reject

**Filters:** By stage, by category, by date

---

## Component Reuse Map

| Component | Used On |
|-----------|---------|
| `<ServiceCard />` | Home, /services |
| `<ProviderCard />` | /services/[slug], /admin/providers |
| `<BookingCard />` | /dashboard/bookings, /provider/jobs |
| `<ReviewCard />` | Home, /services/[slug] |
| `<StatusBadge />` | All dashboard pages |
| `<MetricCard />` | Home hero, /provider/dashboard |
| `<StepIndicator />` | Booking flow, provider onboarding |
