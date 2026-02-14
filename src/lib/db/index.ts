import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

/**
 * Database connection for Neon Postgres.
 *
 * Uses Neon Postgres (Vercel Postgres migrated to Neon) for both development and production.
 * The schema (schema.ts) uses PostgreSQL types.
 *
 * Set DATABASE_URL environment variable to your Neon/Postgres connection string.
 * For local development, you can use a local PostgreSQL instance or a Neon development database.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
