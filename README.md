# QUEUELESS

Stop Waiting. Start Living.

QUEUELESS is a Pakistani B2B queue management platform. Businesses such as clinics, salons and service centers use it to manage physical queues digitally. Customers get a digital token, leave the waiting area, and are notified when their turn is approaching.

This is a real, deployable full-stack app: a React (Vite) frontend, a Node/Express API running as Vercel serverless functions, and a Supabase (Postgres) database. Queue state is persisted server-side and shared live between the customer view and the business dashboard — it survives page refreshes and works across different browsers/devices, not just one browser tab.

## Demo flow

Customer side:
1. Open the homepage and click Join a Queue.
2. Choose a business (CityCare Diagnostic Center, Glow Salon, or QuickFix Service Center).
3. Choose a service to get a digital token.
4. See your token, the currently serving token, and your estimated wait.
5. Click Notify Me When I'm Close, or click Simulate Next Notification to preview the almost-next alert. (Push notifications are simulated in the UI — there's no real device push integration.)

Business side:
1. Click For Businesses and log in with one of the demo accounts below.
2. View today's queue, currently serving customer, and stats.
3. Click Call Next Customer to advance the queue.
4. Click Add Customer to add a new customer directly from the counter.
5. Click Open Display Screen for a full-screen "Now Serving" board meant for a waiting-room TV/monitor — it updates live and needs no login (see below).

The customer and business views both read from the same backend and poll for updates every few seconds, so calling the next customer on the business dashboard updates a customer's estimated wait in (near) real time, even in a different browser.

### Notification history

Once a customer joins a queue, a bell icon appears on their ticket page with a running log of status changes ("You joined the queue…", "3 people ahead of you now", "It's your turn…"). It's simulated client-side (stored in the browser, not pushed from a server) and survives a refresh, same as the ticket itself.

### Waiting-room display screen

`Open Display Screen` (on the business dashboard) opens `/?display=<businessId>` in a new tab — a full-screen, no-login "Now Serving" board with the current token in large type and the next few tokens queued up, polling for updates every few seconds. Meant to be left open full-screen on a TV or monitor in the waiting area.

### Demo business accounts

| Business | Email | Password |
|---|---|---|
| CityCare Diagnostic Center | citycare@queueless.pk | demo1234 |
| Glow Salon | glow@queueless.pk | demo1234 |
| QuickFix Service Center | quickfix@queueless.pk | demo1234 |

These are seeded automatically the first time the server runs against an empty database. Change or remove them before using this with real customer data.

## Tech

- **Frontend**: React + Vite, icons from lucide-react.
- **Backend**: Node.js + Express, running as a Vercel serverless function ([api/index.js](api/index.js)) in production, or a normal long-running process locally ([server/index.js](server/index.js)).
- **Database**: Postgres, hosted on Supabase.
- **Auth**: JWT-based session for business owners (bcrypt-hashed passwords). Customers don't need an account — their queue ticket is tied to a token stored in their browser's local storage.

## Running locally

Requires Node 18.18+.

```bash
npm install
npm run dev
```

This runs the API server (port 3001) and the Vite dev server (port 5173, proxying `/api` requests to the backend) together. Open the URL Vite prints (usually http://localhost:5173).

You need a `POSTGRES_URL` pointing at a real Postgres database for anything to work — see Configuration below. The schema is created and the three demo businesses are seeded automatically the first time the server handles a request against an empty database.

## Configuration

Copy `.env.example` to `.env` and fill in:

```
JWT_SECRET=replace-with-a-long-random-string
POSTGRES_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres
PORT=3001
```

- `POSTGRES_URL`: from your Supabase project, **Project Settings → Database → Connection string**. Use the **Transaction pooler** connection string (port 6543) rather than the direct connection — serverless functions open a lot of short-lived connections, and the pooler is built for that.
- `JWT_SECRET`: should always be a real random secret before deploying anywhere real users can reach — without it the server falls back to an insecure default and prints a warning.

## Deploying (Vercel + Supabase)

1. **Create a Supabase project** at supabase.com (free tier is fine) if you don't have one yet.
2. **Get the connection string**: in the Supabase dashboard, Project Settings → Database → Connection string → Transaction pooler. Copy it (it includes a placeholder for your database password — use the one you set when creating the project).
3. **In the Vercel project** (Settings → Environment Variables), add:
   - `POSTGRES_URL` — the Supabase connection string from step 2
   - `JWT_SECRET` — a long random string (e.g. generate one with `openssl rand -base64 32`)
4. Push to the GitHub repo connected to the Vercel project (or run `vercel deploy` / `vercel --prod`). Vercel auto-detects the Vite frontend and the `api/index.js` serverless function; [vercel.json](vercel.json) routes all `/api/*` requests to it.
5. First request against the fresh database creates the schema and seeds the three demo businesses automatically — no manual migration step. If you'd rather set it up immediately instead of waiting for the first request, run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor.

### Self-hosting elsewhere (no Vercel)

The same code also runs as a single long-lived Node process — useful for Railway/Render/Fly.io/a VPS instead of Vercel:

```bash
npm install && npm run build
npm start
```

`npm start` serves the built frontend and the API from one Node process on one port (`PORT`, default 3001). You still need `POSTGRES_URL` and `JWT_SECRET` set. Supabase's Postgres works the same way outside Vercel too — just use the **Session pooler** or direct connection string instead of the transaction pooler if you're running one persistent server process rather than serverless functions.
