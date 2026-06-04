# Everiithing•com — Database Schema

## Platform: Supabase (PostgreSQL)

---

## Tables

### `profiles`
Extends Supabase auth.users. One row per user regardless of role.

```sql
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('customer', 'provider', 'admin')),
  full_name   text,
  phone       text unique,
  email       text unique,
  avatar_url  text,
  lga         text,           -- Local Government Area (Lagos)
  state       text default 'Lagos',
  nin         text,           -- National ID Number (providers only)
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

---

### `service_categories`
The 7 MVP categories.

```sql
create table service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  icon_url    text,
  is_active   boolean default true,
  sort_order  int default 0
);
```

---

### `services`
Sub-services within each category with flat-rate pricing.

```sql
create table services (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references service_categories(id),
  name            text not null,
  description     text,
  base_price_ngn  int not null,       -- price in kobo (multiply by 100)
  max_price_ngn   int,
  duration_hours  numeric(4,1),       -- estimated job duration
  is_active       boolean default true
);
```

---

### `providers`
Extended profile for verified artisans.

```sql
create table providers (
  id                  uuid primary key references profiles(id),
  bio                 text,
  years_experience    int,
  verification_status text default 'pending'
                      check (verification_status in (
                        'pending', 'under_review', 'interview_scheduled',
                        'skills_test', 'approved', 'rejected', 'suspended'
                      )),
  verified_at         timestamptz,
  rating              numeric(3,2) default 0,
  total_jobs          int default 0,
  total_earnings_ngn  bigint default 0,
  available_balance   bigint default 0,
  is_available        boolean default true,
  service_lgas        text[],         -- array of LGAs they serve
  created_at          timestamptz default now()
);
```

---

### `provider_categories`
Which categories each provider is verified in.

```sql
create table provider_categories (
  provider_id  uuid references providers(id),
  category_id  uuid references service_categories(id),
  primary key (provider_id, category_id)
);
```

---

### `provider_documents`
KYC documents submitted during verification.

```sql
create table provider_documents (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid references providers(id),
  doc_type      text check (doc_type in (
                  'nin', 'id_card', 'certificate', 'guarantor_form',
                  'reference_letter', 'profile_photo'
                )),
  file_url      text not null,        -- Supabase Storage URL
  verified      boolean default false,
  uploaded_at   timestamptz default now()
);
```

---

### `bookings`
Core transaction table.

```sql
create table bookings (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid references profiles(id),
  provider_id         uuid references providers(id),
  service_id          uuid references services(id),
  status              text default 'pending'
                      check (status in (
                        'pending', 'confirmed', 'provider_assigned',
                        'in_progress', 'completed', 'disputed',
                        'cancelled', 'refunded'
                      )),
  scheduled_date      date not null,
  scheduled_time      time not null,
  address             text not null,
  lga                 text not null,
  notes               text,
  price_ngn           bigint not null,    -- final price in kobo
  platform_fee_ngn    bigint,             -- 15-20% commission
  provider_payout_ngn bigint,
  payment_status      text default 'unpaid'
                      check (payment_status in (
                        'unpaid', 'paid', 'in_escrow',
                        'released', 'refunded'
                      )),
  flw_tx_ref          text unique,        -- Flutterwave transaction reference
  completed_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
```

---

### `reviews`
Post-job customer reviews.

```sql
create table reviews (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references bookings(id) unique,
  customer_id  uuid references profiles(id),
  provider_id  uuid references providers(id),
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now()
);
```

---

### `disputes`
Raised when a customer is dissatisfied.

```sql
create table disputes (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references bookings(id),
  raised_by    uuid references profiles(id),
  reason       text not null,
  evidence_urls text[],              -- photos/docs uploaded
  status       text default 'open'
               check (status in ('open', 'under_review', 'resolved', 'escalated')),
  resolution   text,
  resolved_by  uuid references profiles(id),
  resolved_at  timestamptz,
  created_at   timestamptz default now()
);
```

---

### `notifications`
In-app notification log.

```sql
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  type        text,    -- 'booking_confirmed', 'provider_assigned', etc.
  title       text,
  body        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);
```

---

### `verification_pipeline`
Tracks each stage of provider verification.

```sql
create table verification_pipeline (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid references providers(id),
  stage        text check (stage in (
                 'documents', 'identity', 'references',
                 'guarantor', 'interview', 'skills_test', 'training'
               )),
  status       text default 'pending'
               check (status in ('pending', 'in_progress', 'passed', 'failed')),
  notes        text,
  reviewed_by  uuid references profiles(id),   -- admin user
  reviewed_at  timestamptz,
  created_at   timestamptz default now()
);
```

---

## Row Level Security (RLS) Rules

```sql
-- Customers can only see their own bookings
create policy "customers_own_bookings" on bookings
  for select using (auth.uid() = customer_id);

-- Providers can only see bookings assigned to them
create policy "providers_assigned_bookings" on bookings
  for select using (auth.uid() = provider_id);

-- Only admins can see all bookings
create policy "admin_all_bookings" on bookings
  for all using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Providers can only see their own documents
create policy "providers_own_documents" on provider_documents
  for all using (auth.uid() = provider_id);
```

---

## Indexes

```sql
create index idx_bookings_customer    on bookings(customer_id);
create index idx_bookings_provider    on bookings(provider_id);
create index idx_bookings_status      on bookings(status);
create index idx_bookings_date        on bookings(scheduled_date);
create index idx_providers_status     on providers(verification_status);
create index idx_providers_lga        on providers using gin(service_lgas);
create index idx_reviews_provider     on reviews(provider_id);
create index idx_notifications_user   on notifications(user_id, is_read);
```

---

## Supabase Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `provider-documents` | KYC docs, ID uploads | Private (admin only) |
| `provider-photos` | Profile photos | Public |
| `dispute-evidence` | Photos for disputes | Private (admin + owner) |
| `service-images` | Category/service photos | Public |
