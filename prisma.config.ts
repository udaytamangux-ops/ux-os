import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer auto-loads .env for the config file — load it ourselves
// Node 22 built-in; no dotenv dependency needed.
try {
  process.loadEnvFile();
} catch {
  // .env not present — env() below will show a clear error if the variable is missing.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
  url: env("DATABASE_URL"),
   },
});
