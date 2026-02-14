import { defineConfig } from "drizzle-kit";

// Local dev: SQLite
// Production: swap to Neon Postgres (see ARCHITECTURE.md roadmap)
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./local.db",
  },
});
