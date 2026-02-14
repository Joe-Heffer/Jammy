import * as schema from "./schema";
import { drizzle as drizzlePg } from "drizzle-orm/vercel-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { sql as vercelSql } from "@vercel/postgres";

/**
 * Database connection with environment-based driver selection.
 *
 * Local dev (NODE_ENV=development): SQLite via better-sqlite3 (zero setup, file-based)
 * Production (NODE_ENV=production): Vercel Postgres via @vercel/postgres
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
  // Production: Use Vercel Postgres
  db = drizzlePg(vercelSql, { schema });
}

export { db };
