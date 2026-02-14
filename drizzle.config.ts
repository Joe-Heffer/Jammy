import { defineConfig } from "drizzle-kit";

// Local dev: SQLite via local.db
// Production: Neon Postgres via DATABASE_URL (Vercel Postgres migrated to Neon)
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/jammy_dev",
  },
});
