import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Use a dummy URL for client generation if DATABASE_URL is not set
// This allows prisma generate to work without a database connection
// The actual connection will be used at runtime via the Prisma client
let databaseUrl = "postgresql://dummy:dummy@localhost:5432/dummy";
let directUrl = databaseUrl;

try {
  const dbUrl = env("DATABASE_URL");
  if (dbUrl && dbUrl.trim() !== "") {
    // Remove quotes if present and trim
    databaseUrl = dbUrl.replace(/^["']|["']$/g, "").trim();
  }
} catch (e) {
  // DATABASE_URL not set, use dummy URL for generation
}

// Log which DB will be used for migrations (avoid deploying to wrong env)
function dbNameFromUrl(url) {
  try {
    const m = url.match(/\/\/(?:[^@]+@)?[^/]+\/([^?]+)/);
    return m ? m[1] : "(unknown)";
  } catch (_) {
    return "(unknown)";
  }
}
if (process.argv.includes("migrate") && process.argv.includes("deploy")) {
  const name = dbNameFromUrl(databaseUrl);
  console.warn("[prisma.config] Using database:", name);
  if (name.includes("staging") && process.env.NODE_ENV === "production") {
    console.warn("[prisma.config] WARNING: NODE_ENV=production but database is staging. Set DATABASE_URL to production.");
  }
}

try {
  const directDbUrl = env("DATABASE_DIRECT_URL");
  if (directDbUrl && directDbUrl.trim() !== "") {
    // Remove quotes if present and trim
    directUrl = directDbUrl.replace(/^["']|["']$/g, "").trim();
  } else {
    directUrl = databaseUrl;
  }
} catch (e) {
  // DATABASE_DIRECT_URL not set, use databaseUrl
}

export default defineConfig({
  schema: "src/prisma/db/schema.prisma",
  migrations: {
    path: "src/prisma/db/migrations",
  },
  datasource: {
    url: env("DATABASE_URL")?.trim() || directUrl,
    directUrl: directUrl,
  },
});
