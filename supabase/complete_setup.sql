-- ============================================================
-- Everiithing.com — Complete Database Setup
-- Run this ONCE in the Supabase SQL Editor.
-- Uses CREATE TABLE IF NOT EXISTS so it's safe to re-run.
-- ============================================================

-- ── 1. profiles ────────────────────────────────────────────
-- Extends auth.users. One row per user regardless of role.
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('customer', 'provider', 'admin')),
  full_name   text,
  phone       text unique,
  email       text unique,
  avatar_url  text,
  lga         text,
  state       text default 'Lagos',
  nin         text,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 2. service_categories ─────────────────────────────────
-- The 7 MVP top-level categories.
CREATE TABLE IF NOT EXISTS service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  icon_url    text,
  is_active   boolean default true,
  sort_order  int default 0
);

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON service_categories
  FOR SELECT USING (true);

CREATE POLICY "admin_write_categories" ON service_categories
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 3. services ───────────────────────────────────────────
-- Sub-services within each category with flat-rate pricing.
CREATE TABLE IF NOT EXISTS services (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references service_categories(id),
  name            text not null,
  description     text,
  base_price_ngn  int not null,
  max_price_ngn   int,
  duration_hours  numeric(4,1),
  is_active       boolean default true
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (true);

CREATE POLICY "admin_write_services" ON services
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 4. providers ──────────────────────────────────────────
-- Extended profile for verified artisans.
CREATE TABLE IF NOT EXISTS providers (
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
  service_lgas        text[],
  created_at          timestamptz default now()
);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_read_own" ON providers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "providers_update_own" ON providers
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_all_providers" ON providers
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

CREATE POLICY "public_read_providers" ON providers
  FOR SELECT USING (is_available = true);

-- ── 5. provider_categories ────────────────────────────────
-- Which categories each provider is verified in.
CREATE TABLE IF NOT EXISTS provider_categories (
  provider_id  uuid references providers(id),
  category_id  uuid references service_categories(id),
  primary key (provider_id, category_id)
);

ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_own_categories" ON provider_categories
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "admin_all_provider_categories" ON provider_categories
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

CREATE POLICY "public_read_provider_categories" ON provider_categories
  FOR SELECT USING (true);

-- ── 6. provider_documents ─────────────────────────────────
-- KYC documents submitted during verification.
CREATE TABLE IF NOT EXISTS provider_documents (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid references providers(id),
  doc_type      text check (doc_type in (
                  'nin', 'id_card', 'certificate', 'guarantor_form',
                  'reference_letter', 'profile_photo'
                )),
  file_url      text not null,
  verified      boolean default false,
  uploaded_at   timestamptz default now()
);

ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;

-- From DATABASE.md
CREATE POLICY "providers_own_documents" ON provider_documents
  FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "admin_all_documents" ON provider_documents
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 7. bookings ───────────────────────────────────────────
-- Core transaction table.
CREATE TABLE IF NOT EXISTS bookings (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid references profiles(id),
  provider_id         uuid references providers(id),
  service_id          uuid references services(id),
  status              text default 'pending'
                      check (status in (
                        'pending', 'pending_quote', 'confirmed',
                        'provider_assigned', 'in_progress', 'completed',
                        'disputed', 'cancelled', 'refunded'
                      )),
  scheduled_date      date not null,
  scheduled_time      time not null,
  address             text not null,
  lga                 text not null,
  notes               text,
  price_ngn           bigint not null,
  platform_fee_ngn    bigint,
  provider_payout_ngn bigint,
  payment_status      text default 'unpaid'
                      check (payment_status in (
                        'unpaid', 'paid', 'in_escrow',
                        'released', 'refunded'
                      )),
  flw_tx_ref          text unique,
  completed_at        timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- From DATABASE.md
CREATE POLICY "customers_own_bookings" ON bookings
  FOR SELECT USING (auth.uid() = customer_id);

-- From DATABASE.md
CREATE POLICY "providers_assigned_bookings" ON bookings
  FOR SELECT USING (auth.uid() = provider_id);

-- From DATABASE.md
CREATE POLICY "admin_all_bookings" ON bookings
  FOR ALL USING (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

CREATE POLICY "customers_insert_bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- ── 8. reviews ────────────────────────────────────────────
-- Post-job customer reviews.
CREATE TABLE IF NOT EXISTS reviews (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid references bookings(id) unique,
  customer_id  uuid references profiles(id),
  provider_id  uuid references profiles(id),
  rating       int not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "customers_insert_reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "admin_all_reviews" ON reviews
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 9. disputes ───────────────────────────────────────────
-- Raised when a customer is dissatisfied.
CREATE TABLE IF NOT EXISTS disputes (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references bookings(id),
  raised_by     uuid references profiles(id),
  reason        text not null,
  evidence_urls text[],
  status        text default 'open'
                check (status in ('open', 'under_review', 'resolved', 'escalated')),
  resolution    text,
  resolved_by   uuid references profiles(id),
  resolved_at   timestamptz,
  created_at    timestamptz default now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "involved_read_disputes" ON disputes
  FOR SELECT USING (
    auth.uid() = raised_by
    OR auth.uid() = resolved_by
    OR exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

CREATE POLICY "customers_insert_disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "admin_all_disputes" ON disputes
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 10. notifications ─────────────────────────────────────
-- In-app notification log.
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id),
  type        text,
  title       text,
  body        text,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_all_notifications" ON notifications
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── 11. verification_pipeline ─────────────────────────────
-- Tracks each stage of provider verification.
CREATE TABLE IF NOT EXISTS verification_pipeline (
  id           uuid primary key default gen_random_uuid(),
  provider_id  uuid references providers(id),
  stage        text check (stage in (
                 'documents', 'identity', 'references',
                 'guarantor', 'interview', 'skills_test', 'training'
               )),
  status       text default 'pending'
               check (status in ('pending', 'in_progress', 'passed', 'failed')),
  notes        text,
  reviewed_by  uuid references profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz default now()
);

ALTER TABLE verification_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_read_own_pipeline" ON verification_pipeline
  FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "admin_all_pipeline" ON verification_pipeline
  FOR ALL USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ── Indexes (from DATABASE.md) ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_customer    ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider    ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date        ON bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_providers_status     ON providers(verification_status);
CREATE INDEX IF NOT EXISTS idx_providers_lga        ON providers USING gin(service_lgas);
CREATE INDEX IF NOT EXISTS idx_reviews_provider     ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, is_read);
