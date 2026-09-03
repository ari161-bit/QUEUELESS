import pg from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const { Pool } = pg;

if (!process.env.POSTGRES_URL) {
  console.warn(
    "[queueless] WARNING: POSTGRES_URL is not set. Set it to a Postgres connection string (e.g. from Vercel Postgres / Neon)."
  );
}

const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.POSTGRES_URL || "");

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export function query(text, params) {
  return pool.query(text, params);
}

async function ensureSchema() {
  await pool.query(`
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
  `);
}

const seedBusinesses = [
  {
    name: "CityCare Diagnostic Center",
    category: "Clinic",
    prefix: "A",
    services: ["General Consultation", "Blood Test", "X-Ray", "Ultrasound"],
    avgServiceMinutes: 5,
    completedCount: 18,
    serving: { token: "A32", name: "Nadia Farooqi", service: "General Consultation" },
    waitingCount: 5,
    email: "citycare@queueless.pk",
  },
  {
    name: "Glow Salon",
    category: "Salon",
    prefix: "B",
    services: ["Haircut", "Hair Color", "Manicure", "Facial"],
    avgServiceMinutes: 10,
    completedCount: 9,
    serving: { token: "B10", name: "Ayesha Khan", service: "Haircut" },
    waitingCount: 4,
    email: "glow@queueless.pk",
  },
  {
    name: "QuickFix Service Center",
    category: "Service Center",
    prefix: "C",
    services: ["Mobile Repair", "Laptop Repair", "Appliance Repair"],
    avgServiceMinutes: 15,
    completedCount: 4,
    serving: { token: "C5", name: "Bilal Ahmed", service: "Laptop Repair" },
    waitingCount: 3,
    email: "quickfix@queueless.pk",
  },
];

const seedNames = [
  "Ali Raza", "Sara Malik", "Hassan Tariq", "Ayesha Noor", "Bilal Sheikh",
  "Fatima Iqbal", "Usman Farooq", "Zainab Aslam", "Hamza Khan", "Mahnoor Butt",
];

// Seeds are inserted with ON CONFLICT DO NOTHING keyed on the unique email,
// so concurrent cold starts racing to seed the same empty database is safe.
async function seedBusinessIfMissing(b) {
  const demoPasswordHash = bcrypt.hashSync("demo1234", 10);
  const servingNum = parseInt(b.serving.token.replace(/\D/g, ""), 10);

  const insertResult = await pool.query(
    `INSERT INTO businesses
       (name, category, prefix, services, avg_service_minutes, completed_count, next_number, email, password_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [
      b.name,
      b.category,
      b.prefix,
      JSON.stringify(b.services),
      b.avgServiceMinutes,
      b.completedCount,
      servingNum + b.waitingCount + 1,
      b.email,
      demoPasswordHash,
    ]
  );

  if (insertResult.rows.length === 0) return; // already seeded
  const businessId = insertResult.rows[0].id;

  await pool.query(
    `INSERT INTO queue_entries (id, business_id, token, name, service, status)
     VALUES ($1, $2, $3, $4, $5, 'serving')`,
    [randomUUID(), businessId, b.serving.token, b.serving.name, b.serving.service]
  );

  for (let i = 0; i < b.waitingCount; i++) {
    const num = servingNum + i + 1;
    await pool.query(
      `INSERT INTO queue_entries (id, business_id, token, name, service, status)
       VALUES ($1, $2, $3, $4, $5, 'waiting')`,
      [
        randomUUID(),
        businessId,
        b.prefix + num,
        seedNames[(num + i) % seedNames.length],
        b.services[i % b.services.length],
      ]
    );
  }
}

let readyPromise = null;
export function ensureReady() {
  if (!readyPromise) {
    readyPromise = ensureSchema().then(() => Promise.all(seedBusinesses.map(seedBusinessIfMissing)));
  }
  return readyPromise;
}
