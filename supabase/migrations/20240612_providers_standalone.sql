-- ============================================================
-- Decouple providers from profiles — providers are standalone
-- in this concierge MVP (they never log in).
-- ============================================================

ALTER TABLE providers
  DROP CONSTRAINT IF EXISTS providers_id_fkey;

ALTER TABLE providers
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone    text,
  ADD COLUMN IF NOT EXISTS email    text,
  ADD COLUMN IF NOT EXISTS notes    text;

CREATE INDEX IF NOT EXISTS idx_providers_phone ON providers(phone);
