-- ============================================================
-- Fix recursive RLS on profiles + provider_categories insert policy
-- Run this ONCE in Supabase SQL Editor after existing migrations.
-- ============================================================

-- 1. SECURITY DEFINER helper — bypasses RLS to check admin role.
--    This replaces inline `exists (select 1 from profiles ...)` which
--    causes infinite recursion (error 42P17) because the subquery
--    triggers RLS on profiles again.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Drop old recursive policies and recreate them using is_admin().

DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_write_categories" ON service_categories;
CREATE POLICY "admin_write_categories" ON service_categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_write_services" ON services;
CREATE POLICY "admin_write_services" ON services
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_providers" ON providers;
CREATE POLICY "admin_all_providers" ON providers
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_provider_categories" ON provider_categories;
CREATE POLICY "admin_all_provider_categories" ON provider_categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_documents" ON provider_documents;
CREATE POLICY "admin_all_documents" ON provider_documents
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_bookings" ON bookings;
CREATE POLICY "admin_all_bookings" ON bookings
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_reviews" ON reviews;
CREATE POLICY "admin_all_reviews" ON reviews
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_disputes" ON disputes;
CREATE POLICY "admin_all_disputes" ON disputes
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications" ON notifications
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "admin_all_pipeline" ON verification_pipeline;
CREATE POLICY "admin_all_pipeline" ON verification_pipeline
  FOR ALL USING (public.is_admin());

-- Also fix the disputes SELECT policy which has the same pattern
DROP POLICY IF EXISTS "involved_read_disputes" ON disputes;
CREATE POLICY "involved_read_disputes" ON disputes
  FOR SELECT USING (
    auth.uid() = raised_by
    OR auth.uid() = resolved_by
    OR public.is_admin()
  );

-- 3. Add INSERT policy for provider_categories so admins can add rows
DROP POLICY IF EXISTS "admin_insert_provider_categories" ON provider_categories;
CREATE POLICY "admin_insert_provider_categories" ON provider_categories
  FOR INSERT WITH CHECK (public.is_admin());
