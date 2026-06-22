-- Set all services to the flat ₦5,000 call-out fee
-- per the Terms of Service. New bookings use the
-- CALL_OUT_FEE constant (src/lib/constants.ts).
-- Existing bookings keep their original paid amounts.

UPDATE services SET base_price_ngn = 5000 WHERE base_price_ngn != 5000;
