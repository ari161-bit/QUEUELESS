-- QUEUELESS schema + demo seed data for Supabase.
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- The app also creates this schema and seeds this same data automatically on
-- its first request against an empty database, so running this manually is
-- optional -- it just gets you there immediately instead of on first request.

CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  prefix TEXT NOT NULL,
  services JSONB NOT NULL,
  avg_service_minutes INTEGER NOT NULL,
  completed_count INTEGER NOT NULL DEFAULT 0,
  next_number INTEGER NOT NULL DEFAULT 1,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id TEXT PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id),
  token TEXT NOT NULL,
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seq BIGSERIAL
);

-- Demo accounts below all use the password: demo1234
-- (bcrypt hash generated with the same bcryptjs lib + cost factor the app uses)

INSERT INTO businesses
  (name, category, prefix, services, avg_service_minutes, completed_count, next_number, email, password_hash)
VALUES
  (
    'CityCare Diagnostic Center', 'Clinic', 'A',
    '["General Consultation", "Blood Test", "X-Ray", "Ultrasound"]'::jsonb,
    5, 18, 38, 'citycare@queueless.pk',
    '$2a$10$eOxytTG7/RztJNZ8iYBVKeZaG7RlzMx3BU9x4QGzVYJR/o9UN94la'
  ),
  (
    'Glow Salon', 'Salon', 'B',
    '["Haircut", "Hair Color", "Manicure", "Facial"]'::jsonb,
    10, 9, 15, 'glow@queueless.pk',
    '$2a$10$eOxytTG7/RztJNZ8iYBVKeZaG7RlzMx3BU9x4QGzVYJR/o9UN94la'
  ),
  (
    'QuickFix Service Center', 'Service Center', 'C',
    '["Mobile Repair", "Laptop Repair", "Appliance Repair"]'::jsonb,
    15, 4, 9, 'quickfix@queueless.pk',
    '$2a$10$eOxytTG7/RztJNZ8iYBVKeZaG7RlzMx3BU9x4QGzVYJR/o9UN94la'
  )
ON CONFLICT (email) DO NOTHING;

-- Everything below is guarded with "no existing queue_entries for this
-- business" so re-running this whole script is safe and won't duplicate rows.

-- Currently-serving customer for each business
INSERT INTO queue_entries (id, business_id, token, name, service, status)
SELECT gen_random_uuid()::text, b.id, seed.token, seed.name, seed.service, 'serving'
FROM businesses b, (VALUES
  ('citycare@queueless.pk', 'A32', 'Nadia Farooqi', 'General Consultation'),
  ('glow@queueless.pk', 'B10', 'Ayesha Khan', 'Haircut'),
  ('quickfix@queueless.pk', 'C5', 'Bilal Ahmed', 'Laptop Repair')
) AS seed(email, token, name, service)
WHERE b.email = seed.email
  AND NOT EXISTS (SELECT 1 FROM queue_entries qe WHERE qe.business_id = b.id);

-- Waiting queue for CityCare Diagnostic Center (tokens A33-A37)
INSERT INTO queue_entries (id, business_id, token, name, service, status)
SELECT gen_random_uuid()::text, b.id, seed.token, seed.name, seed.service, 'waiting'
FROM businesses b, (VALUES
  ('A33', 'Ayesha Noor', 'General Consultation'),
  ('A34', 'Fatima Iqbal', 'Blood Test'),
  ('A35', 'Zainab Aslam', 'X-Ray'),
  ('A36', 'Mahnoor Butt', 'Ultrasound'),
  ('A37', 'Sara Malik', 'General Consultation')
) AS seed(token, name, service)
WHERE b.email = 'citycare@queueless.pk'
  AND NOT EXISTS (
    SELECT 1 FROM queue_entries qe WHERE qe.business_id = b.id AND qe.status = 'waiting'
  );

-- Waiting queue for Glow Salon (tokens B11-B14)
INSERT INTO queue_entries (id, business_id, token, name, service, status)
SELECT gen_random_uuid()::text, b.id, seed.token, seed.name, seed.service, 'waiting'
FROM businesses b, (VALUES
  ('B11', 'Sara Malik', 'Haircut'),
  ('B12', 'Ayesha Noor', 'Hair Color'),
  ('B13', 'Fatima Iqbal', 'Manicure'),
  ('B14', 'Zainab Aslam', 'Facial')
) AS seed(token, name, service)
WHERE b.email = 'glow@queueless.pk'
  AND NOT EXISTS (
    SELECT 1 FROM queue_entries qe WHERE qe.business_id = b.id AND qe.status = 'waiting'
  );

-- Waiting queue for QuickFix Service Center (tokens C6-C8)
INSERT INTO queue_entries (id, business_id, token, name, service, status)
SELECT gen_random_uuid()::text, b.id, seed.token, seed.name, seed.service, 'waiting'
FROM businesses b, (VALUES
  ('C6', 'Usman Farooq', 'Mobile Repair'),
  ('C7', 'Hamza Khan', 'Laptop Repair'),
  ('C8', 'Ali Raza', 'Appliance Repair')
) AS seed(token, name, service)
WHERE b.email = 'quickfix@queueless.pk'
  AND NOT EXISTS (
    SELECT 1 FROM queue_entries qe WHERE qe.business_id = b.id AND qe.status = 'waiting'
  );
