import puppeteer from "puppeteer";
import config from "../config.js";
import logger from "../config/logger.js";

// Optimized Chrome args for memory and CPU efficiency
// NOTE: Removed --single-process and --no-zygote as they cause "Target closed" errors
const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage", // Use /tmp instead of /dev/shm (important for low-memory / container hosts)
  "--disable-gpu",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-component-extensions-with-background-pages",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-domain-reliability",
  "--disable-features=TranslateUI",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-popup-blocking",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-sync",
  "--disable-translate",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-first-run",
  "--safebrowsing-disable-auto-update",
];

class BrowserPool {
  constructor() {
    this.poolSize = config.PUPPETEER_POOL_SIZE;
    this.browsers = [];
    this.available = [];
    this.waiting = [];
    this.initialized = false;
    this.initializing = false;
  }

  async initialize() {
    // If already initialized, return immediately
    if (this.initialized) return;

    // If currently initializing, wait for it to complete
    if (this.initializing) {
      return new Promise((resolve) => {
        const checkInit = setInterval(() => {
          if (this.initialized) {
            clearInterval(checkInit);
            resolve();
          }
        }, 50);
      });
    }

    this.initializing = true;

    try {
      logger.info(
        `Initializing browser pool with ${this.poolSize} instance(s)...`,
      );

      for (let i = 0; i < this.poolSize; i++) {
        const browser = await this.createBrowser();
        this.browsers.push(browser);
        this.available.push(browser);
      }

      this.initialized = true;
      this.initializing = false;
      logger.info("Browser pool initialized successfully");
    } catch (error) {
      this.initializing = false;
      // Re-throw to let caller handle (e.g., skip template loading)
      throw error;
    }
  }

  async createBrowser() {
    const browser = await puppeteer.launch({
      headless: true,
      args: BROWSER_ARGS,
      // Reduce memory by not loading default viewport
      defaultViewport: { width: 595, height: 842 }, // A4 size in pixels at 72 DPI
    });

    // Handle browser disconnection
    browser.on("disconnected", () => {
      logger.warn("Browser disconnected unexpectedly");
      this.handleBrowserDisconnect(browser);
    });

    return browser;
  }

  handleBrowserDisconnect(browser) {
    // Remove from browsers array
    const browserIndex = this.browsers.indexOf(browser);
    if (browserIndex > -1) {
      this.browsers.splice(browserIndex, 1);
    }

    // Remove from available array
    const availableIndex = this.available.indexOf(browser);
    if (availableIndex > -1) {
      this.available.splice(availableIndex, 1);
    }
  }

  // Check if browser is still connected
  isBrowserHealthy(browser) {
    try {
      return browser.isConnected();
    } catch (e) {
      return false;
    }
  }

  async acquire() {
    // Ensure pool is initialized
    if (!this.initialized) {
      await this.initialize();
    }

    // Try to get a healthy browser from the pool
    while (this.available.length > 0) {
      const browser = this.available.pop();
      if (this.isBrowserHealthy(browser)) {
        return browser;
      }
      // Browser is unhealthy, remove it and try next
      logger.warn("Found unhealthy browser in pool, removing it");
      this.handleBrowserDisconnect(browser);
    }

    // No healthy browsers available, create a new one
    if (this.browsers.length < this.poolSize) {
      logger.info("Creating new browser to replace unhealthy one");
      const newBrowser = await this.createBrowser();
      this.browsers.push(newBrowser);
      return newBrowser;
    }

    // Pool is at capacity, wait for one to become available
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  async release(browser) {
    // Check if browser is still healthy before returning to pool
    if (!this.isBrowserHealthy(browser)) {
      logger.warn("Released browser is unhealthy, creating replacement");
      this.handleBrowserDisconnect(browser);

      // Create replacement if pool is under capacity
      if (this.browsers.length < this.poolSize) {
        const newBrowser = await this.createBrowser();
        this.browsers.push(newBrowser);

        // If there are waiting requests, give them the new browser
        if (this.waiting.length > 0) {
          const resolve = this.waiting.shift();
          resolve(newBrowser);
          return;
        }
        this.available.push(newBrowser);
      }
      return;
    }

    // If there are waiting requests, give browser to the first one
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      resolve(browser);
      return;
    }

    // Otherwise, add back to available pool
    this.available.push(browser);
  }

  async restartBrowser(browser) {
    // Remove old browser from pool
    const index = this.browsers.indexOf(browser);
    if (index > -1) {
      this.browsers.splice(index, 1);
    }

    // Close old browser safely
    try {
      await browser.close();
    } catch (err) {
      logger.warn("Error closing browser during restart:", err.message);
    }

    // Create new browser
    const newBrowser = await this.createBrowser();
    this.browsers.push(newBrowser);

    return newBrowser;
  }

  async shutdown() {
    logger.info("Shutting down browser pool...");
    await Promise.all(
      this.browsers.map(async (browser) => {
        try {
          await browser.close();
        } catch (err) {
          logger.warn("Error closing browser:", err.message);
        }
      }),
    );
    this.browsers = [];
    this.available = [];
    this.initialized = false;
    logger.info("Browser pool shut down");
  }

  getStats() {
    return {
      poolSize: this.poolSize,
      totalBrowsers: this.browsers.length,
      availableBrowsers: this.available.length,
      waitingRequests: this.waiting.length,
      initialized: this.initialized,
    };
  }
}

// Singleton instance
const browserPool = new BrowserPool();

// Graceful shutdown handlers
process.on("SIGINT", async () => {
  await browserPool.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await browserPool.shutdown();
  process.exit(0);
});

export default browserPool;
