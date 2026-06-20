/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Selects the correct Prisma schema based on the DATABASE_PROVIDER env var.
 *
 *   DATABASE_PROVIDER=sqlite     (default) → uses prisma/schema.prisma
 *   DATABASE_PROVIDER=postgresql            → uses prisma/schema.postgres.prisma
 *
 * The chosen schema is copied to prisma/schema.prisma so all subsequent
 * `prisma` CLI commands (generate, db push, migrate) operate on the right
 * provider. This lets the same repo run on SQLite locally and PostgreSQL on
 * Vercel without manual file swaps.
 *
 * Usage:
 *   node scripts/select-schema.js            # auto-select from env var
 *   node scripts/select-schema.js postgres   # force postgresql
 *   node scripts/select-schema.js sqlite     # force sqlite
 */
const fs = require("fs");
const path = require("path");

const prismaDir = path.join(__dirname, "..", "prisma");
const target = path.join(prismaDir, "schema.prisma");
const sqliteSrc = path.join(prismaDir, "schema.sqlite.prisma");
const postgresSrc = path.join(prismaDir, "schema.postgres.prisma");

// Determine the desired provider.
const forced = process.argv[2];
let provider =
  forced === "postgres" || forced === "postgresql"
    ? "postgresql"
    : forced === "sqlite"
    ? "sqlite"
    : process.env.DATABASE_PROVIDER || "sqlite";

// Normalize — treat anything that isn't explicitly "postgresql" as sqlite
// (safe default for local dev).
if (provider !== "postgresql") provider = "sqlite";

// The current schema.prisma IS the sqlite source (kept in place for editor
// tooling + default), so only swap when postgres is requested.
if (provider === "postgresql") {
  if (!fs.existsSync(postgresSrc)) {
    console.error(
      "✗ prisma/schema.postgres.prisma not found. Falling back to sqlite."
    );
    process.exit(0);
  }
  fs.copyFileSync(postgresSrc, target);
  console.log("✓ Prisma schema → PostgreSQL (prisma/schema.postgres.prisma)");
} else {
  // Restore the sqlite schema from the committed schema.sqlite.prisma if it
  // exists; otherwise leave schema.prisma as-is (it's already sqlite).
  if (fs.existsSync(sqliteSrc)) {
    fs.copyFileSync(sqliteSrc, target);
  }
  console.log("✓ Prisma schema → SQLite (prisma/schema.prisma)");
}
