import { defineConfig } from "drizzle-kit";

// Migraciones con la conexión directa (sin pooler) si existe.
const url =
  process.env.KILOKARMA_DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.KILOKARMA_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgresql://placeholder";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
