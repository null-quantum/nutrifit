# NutriFit

NutriFit is an AI-powered nutrition and fitness companion that helps users track meals, understand macros, build healthier habits, and stay consistent with personalised fitness goals.

## Highlights

- Personalised onboarding with daily calorie and macro targets
- Nutrition dashboard for meals, calories, protein, carbohydrates, and fat
- AI meal analysis from a written meal description or a meal photo
- AI fitness assistant, workout generation, and weekly progress reports
- Activity and daily-log tracking
- Offline-friendly experience with local data syncing and installable PWA support
- Responsive dashboard with themes and motion-rich UI

> NutriFit provides estimates and general wellness guidance. It is not a substitute for medical, dietary, or professional fitness advice.

## Built with

- [Next.js](https://nextjs.org/) 16 and [React](https://react.dev/) 19
- TypeScript
- Tailwind CSS 4 and Radix UI
- Prisma ORM with SQLite for local development and PostgreSQL for production
- Google Gemini via the official [`@google/genai`](https://www.npmjs.com/package/@google/genai) SDK
- Dexie / IndexedDB for offline data support
- Recharts for analytics visualisations

## Getting started

### Prerequisites

- Node.js 20 or newer
- A Google AI Studio API key for AI features
- PostgreSQL for a production deployment (SQLite works locally by default)

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy `.env.example` to `.env` (or `.env.local`) and update the values.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Use this configuration as a starting point:

```env
# --- App ---
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# --- Auth ---
# Use a long, random value in production.
JWT_SECRET="replace-with-a-long-random-secret"

# --- Database ---
# SQLite is the default local-development option.
DATABASE_URL="file:./dev.db"
DATABASE_PROVIDER="sqlite"

# --- AI (Gemini) ---
GEMINI_API_KEY="your-google-ai-studio-key"
GEMINI_MODEL="gemini-3.1-flash-lite"
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Keep API keys, database URLs, and secrets out of Git.

### 3. Prepare the database

For local SQLite development:

```bash
npm run db:push
```

For PostgreSQL, set `DATABASE_PROVIDER="postgres"` and a PostgreSQL `DATABASE_URL` first, then run the same command.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server on port 3000. |
| `npm run build` | Select the database schema, generate Prisma Client, and build the production app. |
| `npm run start` | Start the built production server. |
| `npm run lint` | Run ESLint checks. |
| `npm run db:push` | Apply the current Prisma schema to the configured database. |
| `npm run db:generate` | Generate Prisma Client. |
| `npm run db:migrate` | Create and apply a development migration. |
| `npm run db:reset` | Reset the configured database. **This deletes database data.** |
| `npm run db:use-postgres` | Select the PostgreSQL Prisma schema. |

## Deployment

NutriFit can be deployed to Vercel.

1. Push the project to a Git repository and import it into Vercel.
2. Add the production environment variables in **Settings → Environment Variables**:

   ```env
   NEXT_PUBLIC_APP_URL="https://your-domain.com"
   JWT_SECRET="a-long-random-production-secret"
   DATABASE_URL="your-postgresql-connection-string"
   DATABASE_PROVIDER="postgres"
   GEMINI_API_KEY="your-google-ai-studio-key"
   GEMINI_MODEL="gemini-3.1-flash-lite"
   ```

3. Deploy. The build script selects the PostgreSQL schema and generates Prisma Client automatically.

## AI model configuration

The project uses `gemini-3.1-flash-lite` as its standard text-and-image analysis model. It is configured through `GEMINI_MODEL`, so you can change models without modifying application code. The AI helper also includes a fallback model for model-availability issues.

## Project structure

```text
src/
├── app/          # Pages and API routes
├── components/   # Dashboard, landing, auth, PWA, and UI components
├── hooks/        # Reusable React hooks
├── lib/          # AI, authentication, database, nutrition, and offline helpers
└── store/        # Client-side state

prisma/           # SQLite/PostgreSQL schemas and migrations
scripts/          # Database-schema selection used during builds
```

## Security notes

- Never commit `.env`, `.env.local`, API keys, database URLs, or production secrets.
- Use a unique, long `JWT_SECRET` in every production environment.
- Rotate a key immediately if it is ever exposed publicly.
