-- ============================================================
-- Everiithing.com — Backfill Profiles for Existing Users
-- Run ONCE after trigger_auto_profile.sql.
-- Creates a profile row for every auth.users row that
-- doesn't already have one.
-- ============================================================

INSERT INTO public.profiles (id, role, full_name, phone, email)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'role', 'customer'),
  au.raw_user_meta_data ->> 'full_name',
  au.raw_user_meta_data ->> 'phone',
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- ── Check how many were inserted ───────────────────────────
DO $$
DECLARE
  v_count int;
BEGIN
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % profile row(s)', v_count;
END $$;
