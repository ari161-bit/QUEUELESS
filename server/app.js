import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { pool, ensureReady } from "./db.js";
import { signBusinessToken, requireAuth } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();

app.use(cors());
app.use(express.json());

// Make sure the schema exists and demo data is seeded before handling any
// request. Cheap after the first call since ensureReady() memoizes its promise.
app.use(async (req, res, next) => {
  try {
    await ensureReady();
    next();
  } catch (err) {
    console.error("[queueless] Database not ready:", err);
    res.status(503).json({ error: "Database is not available right now." });
  }
});

/* ---------------- helpers ---------------- */

async function serializeBusiness(row) {
  const { rows: servingRows } = await pool.query(
    "SELECT * FROM queue_entries WHERE business_id = $1 AND status = 'serving' LIMIT 1",
    [row.id]
  );
  const { rows: queueRows } = await pool.query(
    "SELECT * FROM queue_entries WHERE business_id = $1 AND status = 'waiting' ORDER BY seq ASC",
    [row.id]
  );
  const serving = servingRows[0];

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    services: row.services,
    prefix: row.prefix,
    avgServiceMinutes: row.avg_service_minutes,
    completedCount: row.completed_count,
    servingCustomer: serving
      ? { id: serving.id, token: serving.token, name: serving.name, service: serving.service }
      : null,
    queue: queueRows.map((e) => ({ id: e.id, token: e.token, name: e.name, service: e.service })),
  };
}

async function getBusinessRow(id) {
  const { rows } = await pool.query("SELECT * FROM businesses WHERE id = $1", [id]);
  return rows[0] || null;
}

/* ---------------- public business + queue routes ---------------- */

app.get("/api/businesses", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM businesses ORDER BY id ASC");
  res.json(await Promise.all(rows.map(serializeBusiness)));
});

app.get("/api/businesses/:id", async (req, res) => {
  const row = await getBusinessRow(req.params.id);
  if (!row) return res.status(404).json({ error: "Business not found." });
  res.json(await serializeBusiness(row));
});

app.post("/api/businesses/:id/join", async (req, res) => {
  const row = await getBusinessRow(req.params.id);
  if (!row) return res.status(404).json({ error: "Business not found." });

  const { service } = req.body || {};
  if (!service || !row.services.includes(service)) {
    return res.status(400).json({ error: "Choose a valid service." });
  }

  const token = row.prefix + row.next_number;
  const id = randomUUID();

  await pool.query("UPDATE businesses SET next_number = next_number + 1 WHERE id = $1", [row.id]);
  await pool.query(
    `INSERT INTO queue_entries (id, business_id, token, name, service, status)
     VALUES ($1, $2, $3, 'You', $4, 'waiting')`,
    [id, row.id, token, service]
  );

  res.status(201).json({ id, token, service, businessId: row.id });
});

app.delete("/api/queue-entries/:entryId", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM queue_entries WHERE id = $1", [req.params.entryId]);
  const entry = rows[0];
  if (!entry || entry.status !== "waiting") {
    return res.status(404).json({ error: "Queue entry not found." });
  }
  await pool.query("DELETE FROM queue_entries WHERE id = $1", [entry.id]);
  res.status(204).end();
});

/* ---------------- auth ---------------- */

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  const { rows } = await pool.query("SELECT * FROM businesses WHERE email = $1", [
    (email || "").trim().toLowerCase(),
  ]);
  const row = rows[0];
  if (!row || !bcrypt.compareSync(password || "", row.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  res.json({ token: signBusinessToken(row), business: { id: row.id, name: row.name } });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const row = await getBusinessRow(req.businessId);
  if (!row) return res.status(404).json({ error: "Business not found." });
  res.json({ id: row.id, name: row.name });
});

/* ---------------- business-owner (authenticated) routes ---------------- */

function requireOwnBusiness(req, res, next) {
  if (Number(req.params.id) !== Number(req.businessId)) {
    return res.status(403).json({ error: "You do not manage this business." });
  }
  next();
}

app.post("/api/businesses/:id/call-next", requireAuth, requireOwnBusiness, async (req, res) => {
  const row = await getBusinessRow(req.params.id);
  if (!row) return res.status(404).json({ error: "Business not found." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: nextRows } = await client.query(
      "SELECT * FROM queue_entries WHERE business_id = $1 AND status = 'waiting' ORDER BY seq ASC LIMIT 1 FOR UPDATE",
      [row.id]
    );
    const nextEntry = nextRows[0];
    if (!nextEntry) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No customers waiting." });
    }

    const { rows: servingRows } = await client.query(
      "SELECT * FROM queue_entries WHERE business_id = $1 AND status = 'serving' LIMIT 1",
      [row.id]
    );
    const currentServing = servingRows[0];

    if (currentServing) {
      await client.query("UPDATE queue_entries SET status = 'done' WHERE id = $1", [currentServing.id]);
      await client.query("UPDATE businesses SET completed_count = completed_count + 1 WHERE id = $1", [row.id]);
    }
    await client.query("UPDATE queue_entries SET status = 'serving' WHERE id = $1", [nextEntry.id]);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  res.json(await serializeBusiness(await getBusinessRow(row.id)));
});

app.post("/api/businesses/:id/customers", requireAuth, requireOwnBusiness, async (req, res) => {
  const row = await getBusinessRow(req.params.id);
  if (!row) return res.status(404).json({ error: "Business not found." });

  const { name, service } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: "Enter the customer's name." });
  if (!service || !row.services.includes(service)) {
    return res.status(400).json({ error: "Choose a valid service." });
  }

  const token = row.prefix + row.next_number;
  await pool.query("UPDATE businesses SET next_number = next_number + 1 WHERE id = $1", [row.id]);
  await pool.query(
    `INSERT INTO queue_entries (id, business_id, token, name, service, status)
     VALUES ($1, $2, $3, $4, $5, 'waiting')`,
    [randomUUID(), row.id, token, name.trim(), service]
  );

  res.status(201).json(await serializeBusiness(await getBusinessRow(row.id)));
});

/* ---------------- static frontend (non-Vercel production only) ---------------- */
/* On Vercel, the built frontend is served directly by Vercel's static hosting;
   this app only ever receives /api/* requests there. This block is for
   self-hosting the whole thing as one Node process elsewhere (e.g. `npm start`). */

if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distDir = path.join(__dirname, "..", "dist");
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}
