/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Prisma Schema Selector
 *
 * Supports:
 * DATABASE_PROVIDER=sqlite
 * DATABASE_PROVIDER=postgres
 * DATABASE_PROVIDER=postgresql
 *
 * Default:
 * sqlite
 *
 * Usage:
 * node scripts/select-schema.js
 * node scripts/select-schema.js sqlite
 * node scripts/select-schema.js postgres
 * node scripts/select-schema.js postgresql
 */

const fs = require("fs");
const path = require("path");

const prismaDir = path.join(__dirname, "..", "prisma");

const SQLITE_SCHEMA = path.join(prismaDir, "schema.sqlite.prisma");
const POSTGRES_SCHEMA = path.join(prismaDir, "schema.postgres.prisma");
const TARGET_SCHEMA = path.join(prismaDir, "schema.prisma");

// ----------------------------------------------------
// Read provider
// ----------------------------------------------------

const cliProvider = process.argv[2];
const envProvider = process.env.DATABASE_PROVIDER;

let provider = (cliProvider || envProvider || "sqlite")
  .trim()
  .toLowerCase();

// Accept common aliases
switch (provider) {
  case "postgres":
  case "postgresql":
  case "pg":
    provider = "postgresql";
    break;

  case "sqlite":
    provider = "sqlite";
    break;

  default:
    console.warn(
      `⚠ Unknown DATABASE_PROVIDER="${provider}". Falling back to SQLite.`
    );
    provider = "sqlite";
}

// ----------------------------------------------------
// Select schema
// ----------------------------------------------------

const sourceSchema =
  provider === "postgresql"
    ? POSTGRES_SCHEMA
    : SQLITE_SCHEMA;

// ----------------------------------------------------
// Validate
// ----------------------------------------------------

if (!fs.existsSync(sourceSchema)) {
  console.error(`❌ Prisma schema not found:

${sourceSchema}

Please make sure the schema file exists.`);

  process.exit(1);
}

// ----------------------------------------------------
// Copy schema
// ----------------------------------------------------

try {
  fs.copyFileSync(sourceSchema, TARGET_SCHEMA);

  console.log(
    `✓ Prisma schema → ${
      provider === "postgresql"
        ? "PostgreSQL"
        : "SQLite"
    } (${path.basename(sourceSchema)})`
  );
} catch (err) {
  console.error("❌ Failed to copy Prisma schema.");
  console.error(err);
  process.exit(1);
}