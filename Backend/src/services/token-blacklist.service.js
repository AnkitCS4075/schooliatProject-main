import logger from "../config/logger.js";
import cacheService from "./cache.service.js";

/**
 * Token blacklist service
 * Stores blacklisted tokens in cache (Redis or in-memory)
 */
class TokenBlacklistService {
  /**
   * Blacklist a token
   * @param {string} token - JWT token
   * @param {number} expiryMs - Token expiry time in milliseconds
   */
  async blacklistToken(token, expiryMs) {
    const expiryTime = Date.now() + expiryMs;
    const ttl = expiryMs;
    await cacheService.set(`blacklist:${token}`, true, ttl);
    logger.debug({ token: token.substring(0, 20) + "..." }, "Token blacklisted");
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} - True if blacklisted
   */
  async isBlacklisted(token) {
    return await cacheService.has(`blacklist:${token}`);
  }

  /**
   * Remove token from blacklist (for testing/admin purposes)
   * @param {string} token - JWT token
   */
  async removeFromBlacklist(token) {
    await cacheService.delete(`blacklist:${token}`);
    logger.debug({ token: token.substring(0, 20) + "..." }, "Token removed from blacklist");
  }

  /**
   * Clear all blacklisted tokens
   */
  async clearBlacklist() {
    // For Redis, we can use pattern matching
    // For in-memory, we'd need to track keys
    try {
      const stats = await cacheService.getStats();
      if (stats.type === "redis") {
        // Redis implementation would use SCAN + DEL pattern
        logger.info("Blacklist clear requested (Redis - use FLUSHDB or pattern delete)");
      } else {
        logger.warn("Clear blacklist not fully implemented for in-memory cache");
      }
    } catch (error) {
      logger.error({ error }, "Error clearing blacklist");
    }
  }
}

const tokenBlacklistService = new TokenBlacklistService();

export default tokenBlacklistService;

