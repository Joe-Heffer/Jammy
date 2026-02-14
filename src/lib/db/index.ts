import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Database connection.
 *
 * Local dev: SQLite via better-sqlite3 (zero setup, file-based)
 * Production: Will swap to Neon Postgres + @neondatabase/serverless
 *
 * The switch happens by:
 *   1. Changing this file to use drizzle-orm/neon-serverless
 *   2. Migrating schema.ts from sqlite-core to pg-core
 *   3. Updating drizzle.config.ts dialect to "postgresql"
 * See ARCHITECTURE.md roadmap for details.
 */

const sqlite = new Database("local.db");

// Enable WAL mode for better concurrent read performance
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
