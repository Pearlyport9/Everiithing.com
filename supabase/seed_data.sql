-- ============================================================
-- Everiithing.com — Seed Data for Service Categories & Services
-- Run AFTER complete_setup.sql.
-- Provides the 7 MVP categories and their sub-services.
-- Uses DO blocks so it's safe to re-run (deletes then re-inserts).
-- ============================================================

-- ── Service Categories ─────────────────────────────────────
INSERT INTO service_categories (name, slug, description, sort_order) VALUES
  ('Plumbing',             'plumbing',            'Fix leaks, unblock drains, install fixtures',               1),
  ('Electrical',          'electrical',          'Sockets, wiring, lighting, circuit breakers',               2),
  ('AC Services',         'ac-services',         'Installation, repair, servicing, gas refill',               3),
  ('Generator & Inverter','generator-inverter',   'Repair, install, maintain generators and inverters',        4),
  ('Painting',            'painting',            'Interior, exterior, touch-ups, wallpaper',                  5),
  ('Deep Cleaning',       'deep-cleaning',       'Full house, kitchen, bathroom, move-in/out cleaning',       6),
  ('Carpentry',           'carpentry',           'Furniture assembly, shelving, doors, cabinets',             7)
ON CONFLICT (slug) DO NOTHING;

-- ── Sub-Services ──────────────────────────────────────────
-- Reference category slugs to get their UUIDs so these inserts
-- work regardless of the actual generated IDs.

DO $$
DECLARE
  cat_plumbing     uuid; cat_electrical uuid; cat_ac uuid;
  cat_gen_inv      uuid; cat_painting uuid; cat_cleaning uuid; cat_carpentry uuid;
BEGIN
  SELECT id INTO cat_plumbing     FROM service_categories WHERE slug = 'plumbing';
  SELECT id INTO cat_electrical   FROM service_categories WHERE slug = 'electrical';
  SELECT id INTO cat_ac           FROM service_categories WHERE slug = 'ac-services';
  SELECT id INTO cat_gen_inv      FROM service_categories WHERE slug = 'generator-inverter';
  SELECT id INTO cat_painting     FROM service_categories WHERE slug = 'painting';
  SELECT id INTO cat_cleaning     FROM service_categories WHERE slug = 'deep-cleaning';
  SELECT id INTO cat_carpentry    FROM service_categories WHERE slug = 'carpentry';

  -- All services use the flat ₦5,000 call-out fee per Terms of Service
  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_plumbing, 'Leaky Pipe Repair',       'Fix leaking pipes under sinks, walls, or ceilings',      5000,  1.0),
    (cat_plumbing, 'Drain Unblocking',        'Clear blocked kitchen, bathroom, or floor drains',       5000,  1.0),
    (cat_plumbing, 'Toilet Repair',           'Fix running toilets, flush mechanism, or leaks',         5000,  1.5),
    (cat_plumbing, 'Water Heater Installation','Install or replace electric water heaters',             5000, 2.0),
    (cat_plumbing, 'Pipe Replacement',        'Replace old or burst pipes with new ones',               5000,  2.0);

  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_electrical, 'Socket & Switch Repair',       'Fix or replace faulty sockets and switches',      5000,  1.0),
    (cat_electrical, 'Light Fixture Installation',   'Install new ceiling lights, chandeliers, or wall sconces', 5000, 1.0),
    (cat_electrical, 'Wiring Repair',                'Troubleshoot and repair faulty electrical wiring', 5000, 3.0),
    (cat_electrical, 'Circuit Breaker Replacement',  'Replace old or tripping circuit breakers',        5000,  1.5),
    (cat_electrical, 'Ceiling Fan Installation',     'Install and balance ceiling fans with remote',    5000,  1.5);

  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_ac, 'AC Installation',          'Install split AC units including bracket and piping',       5000, 2.0),
    (cat_ac, 'AC Repair & Troubleshooting','Diagnose and fix AC cooling issues',                     5000,  1.5),
    (cat_ac, 'AC Deep Servicing',        'Thorough cleaning of filters, coils, and drainage',        5000,  1.0),
    (cat_ac, 'AC Gas Refill',            'Refill refrigerant gas to restore cooling performance',    5000,  1.0),
    (cat_ac, 'AC Thermostat Replacement','Replace faulty thermostats and temperature sensors',       5000,  1.0);

  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_gen_inv, 'Generator Repair',         'Diagnose and fix generator starting or running issues',     5000,  2.0),
    (cat_gen_inv, 'Inverter Installation',    'Install and configure inverter with battery bank',         5000, 4.0),
    (cat_gen_inv, 'Battery Replacement',      'Replace inverter batteries with new deep-cycle ones',     5000, 1.5),
    (cat_gen_inv, 'Generator Servicing',      'Routine maintenance — oil change, filter cleaning, plugs', 5000,  1.0),
    (cat_gen_inv, 'Inverter Troubleshooting', 'Diagnose inverter faults and error codes',                5000, 1.5);

  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_painting, 'Interior Painting',     'Paint interior walls, ceilings, and trims per room',        5000, 3.0),
    (cat_painting, 'Exterior Painting',     'Paint exterior walls and surfaces with weather-resistant paint', 5000, 4.0),
    (cat_painting, 'Touch-up Painting',     'Fix scuffs, stains, and small areas needing a refresh',     5000,  1.0),
    (cat_painting, 'Wallpaper Installation','Install wallpaper on prepared walls',                       5000, 2.0),
    (cat_painting, 'Ceiling Painting',      'Paint ceilings including POP and textured surfaces',        5000,  2.0);

  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_cleaning, 'Full House Cleaning',       'Comprehensive cleaning of all rooms and surfaces',        5000, 3.0),
    (cat_cleaning, 'Kitchen Deep Clean',        'Degrease cabinets, scrub tiles, clean appliances inside out', 5000, 2.0),
    (cat_cleaning, 'Bathroom Deep Clean',       'Remove mould, scrub grout, descale fixtures and glass',  5000,  1.5),
    (cat_cleaning, 'Move-in & Move-out Cleaning','Deep clean entire property before moving in or out',    5000, 4.0),
    (cat_cleaning, 'Sofa & Carpet Cleaning',    'Shampoo and deep clean upholstery and carpets',          5000, 2.0);

  INSERT INTO services (category_id, name, description, base_price_ngn, duration_hours) VALUES
    (cat_carpentry, 'Furniture Assembly',     'Assemble flat-pack furniture — beds, tables, shelves, cabinets', 5000, 1.5),
    (cat_carpentry, 'Cabinet Repair',         'Fix broken hinges, drawers, doors, and cabinet frames',    5000,  1.5),
    (cat_carpentry, 'Custom Shelving',        'Build and install custom shelves and storage units',       5000, 2.0),
    (cat_carpentry, 'Door Repair & Replacement','Fix sticking doors, replace hinges, handles, or entire doors', 5000, 1.0),
    (cat_carpentry, 'Wardrobe Installation',  'Install fitted wardrobes with shelves and hanging rails',  5000, 3.0);

END $$;
