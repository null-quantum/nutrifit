# Deploying NutriFit to Vercel

This guide takes you from this codebase to a live, production deployment on
Vercel with a hosted PostgreSQL database and Google Gemini AI.

---

## Architecture at a glance

| Layer | Local dev (this sandbox) | Vercel production |
|---|---|---|
| Framework | Next.js 16 (App Router) | Same |
| Database | Prisma + SQLite (`file:./dev.db`) | Prisma + PostgreSQL (Vercel Postgres / Neon) |
| AI | `z-ai-web-dev-sdk` (sandbox) | Google Gemini (`@google/generative-ai`) |
| Auth | JWT in HTTP-only cookie + Bearer fallback | Same |
| Offline | PWA + IndexedDB local-first | Same |

The codebase auto-detects the AI provider: if `GEMINI_API_KEY` is set it uses
Gemini, otherwise it falls back to the sandbox SDK. So the **same code** runs
in both environments.

---

## Step 1 — Push to GitHub

```bash
# From the project root:

# 1. Create a new repo on GitHub (empty, no README/license).
#    Copy the URL GitHub gives you, e.g. https://github.com/you/nutrifit.git

# 2. Add it as a remote and push:
git remote add origin https://github.com/YOUR_USERNAME/nutrifit.git
git branch -M main
git push -u origin main
```

> The `.gitignore` already excludes `.env`, `node_modules`, `.next/`, `dev.log`,
> `db/*.db`, etc. — so no secrets or build artifacts will be pushed.

---

## Step 2 — Create a PostgreSQL database (free)

Pick **one** of these (all have free tiers):

### Option A: Vercel Postgres (easiest — stays in Vercel)
1. Go to https://vercel.com/dashboard → **Storage** → **Create Database** → **Postgres**.
2. Name it `nutrifit-db`.
3. Once created, copy the **connection string** (looks like
   `postgresql://user:pass@ep-xxx.us-east-1.postgres.vercel-storage.com/db`).

### Option B: Neon (recommended for serverless)
1. Go to https://neon.tech → sign up → create a project.
2. Copy the connection string from the dashboard.

### Option C: Supabase
1. Go to https://supabase.com → new project.
2. Settings → Database → Connection string → URI.

**Save the connection string** — you'll paste it into Vercel in Step 4.

---

## Step 3 — Tell the app to use PostgreSQL (no code edits needed)

The repo ships with **two Prisma schemas**: `schema.sqlite.prisma` (local dev)
and `schema.postgres.prisma` (production). A build script
(`scripts/select-schema.js`) auto-selects the right one based on the
`DATABASE_PROVIDER` env var — so **you don't edit any schema files**.

When you set `DATABASE_PROVIDER=postgresql` in Vercel (Step 4), the
`postinstall` + `build` scripts automatically swap in the Postgres schema and
generate the right Prisma Client. All the query code in `src/lib/` stays
identical between providers.

> Local dev keeps using SQLite (the sandbox can't reach external Postgres).
> Nothing changes for local development — just set `DATABASE_PROVIDER` on Vercel.

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com → **Add New** → **Project**.
2. **Import** your `nutrifit` GitHub repo.
3. Vercel auto-detects Next.js — leave the build settings as-is.
4. **Before clicking Deploy**, expand **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `DATABASE_PROVIDER` | `postgresql` ← **this triggers the auto schema swap** |
   | `DATABASE_URL` | _your Postgres connection string from Step 2_ |
   | `JWT_SECRET` | _a long random string_ (run `openssl rand -hex 32` in terminal) |
   | `GEMINI_API_KEY` | _your Gemini API key_ (get one free at https://aistudio.google.com/app/apikey) |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |

5. Click **Deploy**. Vercel runs `npm install` (which triggers
   `postinstall` → `select-schema.js` picks the Postgres schema →
   `prisma generate`) then `build` (same schema selection + `next build`).

> **First deploy will fail** if the database tables don't exist yet — that's
> expected. Fix it in Step 5.

---

## Step 5 — Create the database tables

The `postinstall` script generates the Prisma Client, but doesn't create
tables. Do that with **one** of these:

### From your local machine (quickest)
```bash
# Temporarily point your local env at the production Postgres DB:
export DATABASE_PROVIDER="postgresql"
export DATABASE_URL="postgresql://...your-vercel-postgres-string..."
bun run db:push
```
This swaps in the Postgres schema (via `select-schema.js`), creates all tables
in your hosted Postgres, then you can `unset DATABASE_PROVIDER DATABASE_URL`
to return to local SQLite dev. Done.

### Or: add a Vercel build command (one-time)
In Vercel → Project → Settings → Build & Development Settings → override the
Build Command to:
```
node scripts/select-schema.js && prisma db push && next build
```
Deploy once (it creates the tables), then set it back to the default
(`node scripts/select-schema.js && prisma generate && next build`) so it
doesn't try to push on every deploy.

---

## Step 6 — Verify

1. Open your Vercel URL (e.g. `nutrifit.vercel.app`).
2. Register an account → complete onboarding → dashboard.
3. Click the floating chatbot (bottom-right) → send a message → Gemini replies.
4. Try the Meal Analyzer + Workout Generator tabs.
5. Install as a PWA (browser install prompt or Chrome menu → Install).

---

## Troubleshooting

**Build fails: "Prisma Client did not generate"**
→ Ensure `postinstall: prisma generate` is in `package.json` (it is). If
   still failing, add `"build": "prisma generate && next build"`.

**Runtime: "Database connection error"**
→ Check `DATABASE_URL` is set in Vercel env vars AND that you ran `db:push`
   against that same database.

**AI features return errors**
→ Check `GEMINI_API_KEY` is set. Test the key at
   https://aistudio.google.com/app/apikey. The model `gemini-2.5-flash` should
   be available on the free tier.

**Cookies / auth not working on Vercel**
→ The app already sets `secure` + `sameSite=none` over HTTPS and has a Bearer
   token fallback. If issues persist, check that `JWT_SECRET` is set.

**Want to use MongoDB Atlas instead of Postgres?**
→ You'd need to swap Prisma for Mongoose — a bigger refactor (the data layer
   is in `src/lib/db.ts`, `src/lib/auth.ts`, and the API routes). Postgres is
   the faster path since Prisma queries stay identical.

---

## Environment variables reference

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_PROVIDER` | ✅ | `sqlite` (local dev) or `postgresql` (Vercel) — triggers schema auto-select |
| `DATABASE_URL` | ✅ | Postgres connection string (prod) or SQLite path (dev) |
| `JWT_SECRET` | ✅ | Signs the auth JWT — use a long random string |
| `GEMINI_API_KEY` | ✅ (prod) | Google Gemini API key for AI features |
| `GEMINI_MODEL` | optional | Defaults to `gemini-2.5-flash` |
