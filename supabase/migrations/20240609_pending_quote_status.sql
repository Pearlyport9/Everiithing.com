-- Add pending_quote to the bookings status check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN (
    'pending', 'pending_quote', 'confirmed', 'provider_assigned',
    'in_progress', 'completed', 'disputed',
    'cancelled', 'refunded'
  ));
