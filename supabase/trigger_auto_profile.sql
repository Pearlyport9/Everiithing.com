-- ============================================================
-- Everiithing.com — Auto-Create Profile on Signup
-- Run ONCE in the Supabase SQL Editor.
-- Safe to re-run (drops trigger + function first).
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ── Function ───────────────────────────────────────────────
-- Fires on every new auth.users row.
-- Inserts a matching profile with defaults.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_full_name text;
  v_phone     text;
BEGIN
  -- Extract metadata if present
  v_full_name := NEW.raw_user_meta_data ->> 'full_name';
  v_phone     := NEW.raw_user_meta_data ->> 'phone';

  INSERT INTO public.profiles (id, role, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    v_full_name,
    v_phone,
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    role        = COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer'),
    full_name   = EXCLUDED.full_name,
    phone       = EXCLUDED.phone,
    email       = EXCLUDED.email,
    updated_at  = now();

  RETURN NEW;
END;
$$;

-- ── Trigger ────────────────────────────────────────────────
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
