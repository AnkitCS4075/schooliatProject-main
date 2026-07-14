/**
 * Clear Rate Limits Script
 * 
 * This script clears the rate limit stores for both authentication and API endpoints.
 * Usage: node scripts/clear-rate-limits.js
 */

import { authRateLimitStore, apiRateLimitStore } from "../src/middlewares/rate-limit.middleware.js";
import logger from "../src/config/logger.js";

async function clearRateLimits() {
  try {
    logger.info("Clearing rate limit stores...");
    
    // Clear authentication rate limit store
    if (authRateLimitStore && typeof authRateLimitStore.resetAll === "function") {
      authRateLimitStore.resetAll();
      logger.info("Authentication rate limit store cleared");
    } else {
      logger.warn("Authentication rate limit store does not support resetAll");
    }
    
    // Clear API rate limit store
    if (apiRateLimitStore && typeof apiRateLimitStore.resetAll === "function") {
      apiRateLimitStore.resetAll();
      logger.info("API rate limit store cleared");
    } else {
      logger.warn("API rate limit store does not support resetAll");
    }
    
    logger.info("Rate limits cleared successfully");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Failed to clear rate limits");
    process.exit(1);
  }
}

clearRateLimits();

