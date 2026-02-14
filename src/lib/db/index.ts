import * as schema from "./schema";
import { drizzle as drizzlePg } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { Pool } from "@neondatabase/serverless";

/**
 * Database connection with environment-based driver selection.
 *
 * Local dev (NODE_ENV=development): SQLite via better-sqlite3 (zero setup, file-based)
 * Production (NODE_ENV=production): Neon Postgres via @neondatabase/serverless
 *
 * The schema (schema.ts) uses PostgreSQL types, which are compatible with both drivers
 * when using the pg-core dialect.
 */

const isDevelopment = process.env.NODE_ENV === "development";

let db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzleSqlite>;

if (isDevelopment) {
  // Development: Use SQLite
  const Database = require("better-sqlite3");
  const sqlite = new Database("local.db");

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma("journal_mode = WAL");

  db = drizzleSqlite(sqlite, { schema });
} else {
  // Production: Use Neon Postgres (Vercel Postgres migrated to Neon)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzlePg(pool, { schema });
}

export { db };
