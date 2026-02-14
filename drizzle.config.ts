import { defineConfig } from "drizzle-kit";

// Uses Neon Postgres for both local development and production
// Vercel Postgres has migrated to Neon as a native integration
// Set DATABASE_URL to your Neon connection string (dev or prod)
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/jammy_dev",
  },
});
