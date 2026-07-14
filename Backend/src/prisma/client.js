import { PrismaClient } from "./generated/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import config from "../config.js";

const { Pool } = pg;

// Remove quotes from connection string if present; ensure it's a non-empty string
let connectionString =
  typeof config.DATABASE_URL === "string"
    ? config.DATABASE_URL.replace(/^["']|["']$/g, "").trim()
    : config.DATABASE_URL;
connectionString = connectionString || undefined;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Set it in .env or environment (e.g. postgresql://user:password@host:5432/dbname). " +
    "On production server, ensure /opt/schooliat/backend/production/shared/.env exists and is loaded."
  );
}

const pool = new Pool({
  connectionString,
  // Supabase connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: config.ENVIRONMENT === "development" ? ["query", "error", "warn"] : ["error"],
});

export { PrismaClient };
export default prisma;
