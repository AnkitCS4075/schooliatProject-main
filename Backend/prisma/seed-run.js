/**
 * Seed runner: loads DATABASE_URL from .env or deployment paths, then runs seed.
 * Use: npm run seed (runs this file)
 *
 * Load order (credentials can be in Backend/.env or the shared env directories):
 * 1. dotenv/config → Backend/.env (when cwd is Backend)
 * 2. Backend/.env (explicit)
 * 3. /opt/schooliat/backend/production/shared/.env (production server)
 * 4. /opt/schooliat/backend/staging/shared/.env (staging server)
 *
 * Seed is run manually (e.g. from repo root: ./seed-env.sh production|staging), not in deploy workflows.
 */

import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

// 1. .env in Backend (already loaded by dotenv/config from cwd; ensure we try backend root)
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(backendRoot, ".env") });
}

// 2. Production deployment shared .env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "/opt/schooliat/backend/production/shared/.env" });
}

// 3. Staging deployment shared .env
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "/opt/schooliat/backend/staging/shared/.env" });
}

const url = process.env.DATABASE_URL;
if (!url || typeof url !== "string" || !url.trim()) {
  console.error("");
  console.error("DATABASE_URL is not set or invalid.");
  console.error("  - For local: create Backend/.env with DATABASE_URL=postgresql://user:password@host:5432/dbname");
  console.error("  - For production: ensure /opt/schooliat/backend/production/shared/.env exists and contains DATABASE_URL");
  console.error("  - Or run: DATABASE_URL='postgresql://...' npm run seed");
  console.error("");
  process.exit(1);
}

await import("./seed.js");
