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

## Step 3 — Switch Prisma from SQLite to PostgreSQL

Edit `prisma/schema.prisma` — change **one line**:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

That's it — all the Prisma queries in `src/lib/` stay identical. Commit + push:

```bash
git add prisma/schema.prisma
git commit -m "Switch Prisma datasource to PostgreSQL for Vercel"
git push
```

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com → **Add New** → **Project**.
2. **Import** your `nutrifit` GitHub repo.
3. Vercel auto-detects Next.js — leave the build settings as-is.
4. **Before clicking Deploy**, expand **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | _your Postgres connection string from Step 2_ |
   | `JWT_SECRET` | _a long random string_ (run `openssl rand -hex 32` in terminal) |
   | `GEMINI_API_KEY` | _your Gemini API key_ (get one free at https://aistudio.google.com/app/apikey) |
   | `GEMINI_MODEL` | `gemini-2.5-flash` |

5. Click **Deploy**. Vercel runs `npm install` (which triggers the
   `postinstall: prisma generate` script) then `next build`.

> **First deploy will fail** if the database tables don't exist yet — that's
> expected. Fix it in Step 5.

---

## Step 5 — Create the database tables

The `postinstall` script generates the Prisma Client, but doesn't create
tables. Do that with **one** of these:

### From your local machine (quickest)
```bash
# Set your prod DATABASE_URL locally temporarily:
export DATABASE_URL="postgresql://...your-vercel-postgres-string..."
bun run db:push
```
This creates all tables in your hosted Postgres. Done.

### Or: add a Vercel build command (one-time)
In Vercel → Project → Settings → Build & Development Settings → override the
Build Command to:
```
prisma db push && next build
```
Deploy once, then set it back to `next build` (so it doesn't try to push on
every deploy).

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
| `DATABASE_URL` | ✅ | Postgres connection string (prod) or SQLite path (dev) |
| `JWT_SECRET` | ✅ | Signs the auth JWT — use a long random string |
| `GEMINI_API_KEY` | ✅ (prod) | Google Gemini API key for AI features |
| `GEMINI_MODEL` | optional | Defaults to `gemini-2.5-flash` |
