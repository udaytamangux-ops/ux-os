import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer auto-loads .env for the config file — load it ourselves
// (Node 22 built-in; no dotenv dependency needed).
try {
  process.loadEnvFile();
} catch {
  // .env not present — env() below will surface a clear error if the var is missing.
}

// Prisma 7 reads connection config from here (not from schema.prisma).
// `env()` resolves variables from the project's .env file.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Use the Supabase "Session pooler" / direct connection (port 5432) for DDL.
    url: env("DATABASE_URL"),
  },
});
