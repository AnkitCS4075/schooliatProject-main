import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../src/config/logger.js";
import bootstrapDataService from "../src/services/bootstrap-data.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(backendRoot, ".env") });
}
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "/opt/schooliat/backend/production/shared/.env" });
}
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "/opt/schooliat/backend/staging/shared/.env" });
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
    process.exit(1);
  }

  try {
    await bootstrapDataService.ensureBaselineData();
    console.log("Bootstrap complete: baseline data is present.");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Failed to bootstrap essential data");
    console.error("Bootstrap failed:", error?.message || error);
    process.exit(1);
  }
}

main();
