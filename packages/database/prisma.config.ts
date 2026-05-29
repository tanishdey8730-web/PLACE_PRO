import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load monorepo root .env
config({ path: path.join(__dirname, "../../.env") });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: { path: path.join(__dirname, "prisma", "migrations") },
  datasource: { url: process.env.DATABASE_URL! },
});
