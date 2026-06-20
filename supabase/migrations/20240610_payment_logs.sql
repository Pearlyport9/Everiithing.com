CREATE TABLE IF NOT EXISTS payment_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          UUID REFERENCES bookings(id) ON DELETE SET NULL,
  flw_tx_ref          TEXT,
  flw_transaction_id  TEXT,
  event_type          TEXT NOT NULL,
  status              TEXT NOT NULL,
  expected_amount     BIGINT,
  paid_amount         BIGINT,
  currency            TEXT DEFAULT 'NGN',
  raw_payload         JSONB,
  error_message       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_booking_id ON payment_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_flw_tx_ref ON payment_logs(flw_tx_ref);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);

ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_logs_admin_select" ON payment_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
