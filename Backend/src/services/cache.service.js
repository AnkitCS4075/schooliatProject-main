import logger from "../config/logger.js";
import { getRedisClient, isRedisConnected } from "../config/redis.client.js";

/**
 * Cache service with Redis support
 * Falls back to in-memory cache if Redis is not available
 */
class CacheService {
  constructor() {
    this.cache = new Map(); // Fallback in-memory cache
    this.ttl = new Map(); // Time-to-live tracking
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    this.useRedis = false;
  }

  /**
   * Check if Redis is available and update flag
   * @returns {boolean}
   */
  _checkRedis() {
    this.useRedis = isRedisConnected();
    return this.useRedis;
  }

  /**
   * Convert milliseconds to seconds (Redis uses seconds for TTL)
   * @param {number} ms - Milliseconds
   * @returns {number} - Seconds
   */
  _msToSeconds(ms) {
    return Math.ceil(ms / 1000);
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Cached value or null if not found/expired
   */
  async get(key) {
    if (this._checkRedis()) {
      try {
        const redis = getRedisClient();
        const value = await redis.get(key);
        if (value === null) {
          return null;
        }
        // Parse JSON value
        return JSON.parse(value);
      } catch (error) {
        logger.warn({ error, key }, "Redis get failed, falling back to memory");
        // Fallback to in-memory
        this.useRedis = false;
      }
    }

    // In-memory fallback
    const ttl = this.ttl.get(key);
    if (ttl && Date.now() > ttl) {
      // Expired, remove from cache
      await this.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds (optional)
   * @returns {Promise<void>}
   */
  async set(key, value, ttlMs = this.defaultTTL) {
    if (this._checkRedis()) {
      try {
        const redis = getRedisClient();
        const ttlSeconds = this._msToSeconds(ttlMs);
        // Store as JSON string
        await redis.setEx(key, ttlSeconds, JSON.stringify(value));
        return;
      } catch (error) {
        logger.warn({ error, key }, "Redis set failed, falling back to memory");
        // Fallback to in-memory
        this.useRedis = false;
      }
    }

    // In-memory fallback
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    if (this._checkRedis()) {
      try {
        const redis = getRedisClient();
        await redis.del(key);
        return;
      } catch (error) {
        logger.warn({ error, key }, "Redis delete failed, falling back to memory");
        // Fallback to in-memory
        this.useRedis = false;
      }
    }

    // In-memory fallback
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  /**
   * Clear all cache
   * @returns {Promise<void>}
   */
  async clear() {
    if (this._checkRedis()) {
      try {
        const redis = getRedisClient();
        await redis.flushDb();
        logger.info("Redis cache cleared");
        return;
      } catch (error) {
        logger.warn({ error }, "Redis clear failed, falling back to memory");
        // Fallback to in-memory
        this.useRedis = false;
      }
    }

    // In-memory fallback
    this.cache.clear();
    this.ttl.clear();
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    if (this._checkRedis()) {
      try {
        const redis = getRedisClient();
        const exists = await redis.exists(key);
        return exists === 1;
      } catch (error) {
        logger.warn({ error, key }, "Redis exists check failed, falling back to memory");
        // Fallback to in-memory
        this.useRedis = false;
      }
    }

    // In-memory fallback
    const ttl = this.ttl.get(key);
    if (ttl && Date.now() > ttl) {
      await this.delete(key);
      return false;
    }
    return this.cache.has(key);
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} - Cache stats
   */
  async getStats() {
    if (this._checkRedis()) {
      try {
        const redis = getRedisClient();
        const dbSize = await redis.dbSize();
        const info = await redis.info("stats");
        
        return {
          type: "redis",
          size: dbSize,
          connected: true,
          info: info,
        };
      } catch (error) {
        logger.warn({ error }, "Redis stats failed, falling back to memory");
        // Fallback to in-memory
        this.useRedis = false;
      }
    }

    // In-memory fallback
    // Clean expired entries
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        await this.delete(key);
      }
    }

    return {
      type: "memory",
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      connected: false,
    };
  }

  /**
   * Get or set pattern (common caching pattern)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch value if not in cache
   * @param {number} ttlMs - Time to live in milliseconds (optional)
   * @returns {Promise<any>} - Cached or fetched value
   */
  async getOrSet(key, fetchFn, ttlMs = this.defaultTTL) {
    const cached = await this.get(key);
    if (cached !== null) {
      logger.debug({ key, type: this.useRedis ? "redis" : "memory" }, "Cache hit");
      return cached;
    }

    logger.debug({ key, type: this.useRedis ? "redis" : "memory" }, "Cache miss, fetching...");
    const value = await fetchFn();
    await this.set(key, value, ttlMs);
    return value;
  }
}

// Singleton instance
const cacheService = new CacheService();

// Cleanup expired entries every minute (only for in-memory cache)
setInterval(async () => {
  if (!cacheService.useRedis) {
    const now = Date.now();
    for (const [key, expiry] of cacheService.ttl.entries()) {
      if (now > expiry) {
        await cacheService.delete(key);
      }
    }
  }
}, 60 * 1000);

export default cacheService;

