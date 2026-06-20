-- ============================================================
-- Everiithing.com — Fix Profiles RLS Infinite Recursion
-- Run ONCE in the Supabase SQL Editor.
-- Safe to re-run.
-- ============================================================

-- ── Drop all existing policies on profiles ─────────────────
DROP POLICY IF EXISTS "users_read_own_profile"          ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile"         ON profiles;
DROP POLICY IF EXISTS "admin_all_profiles"               ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile"    ON profiles;

-- ── Recreate self-access policies (NO self-referencing) ───
-- Direct auth.uid() = id only — never queries profiles inside itself.

CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Admin policy dropped for MVP ───────────────────────────
-- Adding it here would require a SECURITY DEFINER helper
-- function that checks the role WITHOUT querying profiles.
-- Not needed for the current feature set.
