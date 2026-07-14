import { createClient } from "redis";
import config from "../config.js";
import logger from "./logger.js";

/**
 * Redis client configuration and connection
 * Supports both Redis and fallback to in-memory cache
 */

let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client
 * @returns {Promise<Object>} - Redis client instance
 */
const initializeRedis = async () => {
  try {
    // Check if Redis is enabled (REDIS_HOST must be set and not empty)
    if (!config.REDIS_HOST || config.REDIS_HOST === "localhost" && config.ENVIRONMENT === "production") {
      logger.warn("Redis not configured, using in-memory cache");
      return null;
    }

    const clientOptions = {
      socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error("Redis reconnection failed after 10 attempts");
            return new Error("Redis connection failed");
          }
          return Math.min(retries * 100, 3000);
        },
      },
      database: config.REDIS_DB || 0,
    };

    // Add password if provided
    if (config.REDIS_PASSWORD) {
      clientOptions.password = config.REDIS_PASSWORD;
    }

    const client = createClient(clientOptions);

    // Error handling
    client.on("error", (err) => {
      logger.error({ error: err }, "Redis client error");
      isConnected = false;
    });

    client.on("connect", () => {
      logger.info("Redis client connecting...");
    });

    client.on("ready", () => {
      logger.info(`Redis client connected to ${config.REDIS_HOST}:${config.REDIS_PORT} (DB ${config.REDIS_DB || 0})`);
      isConnected = true;
    });

    client.on("reconnecting", () => {
      logger.warn("Redis client reconnecting...");
      isConnected = false;
    });

    client.on("end", () => {
      logger.warn("Redis client connection ended");
      isConnected = false;
    });

    // Connect to Redis
    await client.connect();

    // Test connection
    const pong = await client.ping();
    if (pong === "PONG") {
      logger.info("Redis connection verified");
      redisClient = client;
      isConnected = true;
      return client;
    } else {
      logger.error("Redis ping failed");
      await client.quit();
      return null;
    }
  } catch (error) {
    logger.error({ error }, "Failed to initialize Redis client");
    isConnected = false;
    return null;
  }
};

/**
 * Get Redis client instance
 * @returns {Object|null} - Redis client or null if not connected
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Check if Redis is connected
 * @returns {boolean}
 */
const isRedisConnected = () => {
  return isConnected && redisClient !== null;
};

/**
 * Close Redis connection gracefully
 * @returns {Promise<void>}
 */
const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info("Redis connection closed");
      redisClient = null;
      isConnected = false;
    } catch (error) {
      logger.error({ error }, "Error closing Redis connection");
    }
  }
};

// Initialize Redis on module load (non-blocking)
if (config.ENVIRONMENT !== "test") {
  initializeRedis().catch((err) => {
    logger.error({ error: err }, "Failed to initialize Redis on startup");
  });
}

export {
  initializeRedis,
  getRedisClient,
  isRedisConnected,
  closeRedis,
};

