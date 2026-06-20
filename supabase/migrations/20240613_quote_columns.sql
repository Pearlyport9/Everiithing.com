-- ============================================================
-- Add provider quote columns to bookings table
-- These let the admin record a provider's inspection quote
-- and the top-up amount the client still owes.
-- All nullable — existing bookings are unaffected.
-- ============================================================

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS quoted_total_ngn bigint,
  ADD COLUMN IF NOT EXISTS quote_notes       text,
  ADD COLUMN IF NOT EXISTS topup_owed_ngn    bigint;
