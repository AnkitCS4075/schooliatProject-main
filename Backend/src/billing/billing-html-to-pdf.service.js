import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";

/**
 * Render self-contained billing HTML (invoice/receipt) to a PDF buffer.
 * Uses the shared Puppeteer pool (same pattern as TC and experience certificates).
 *
 * @param {string} html - Full HTML document string
 * @returns {Promise<Buffer>}
 */
export async function renderBillingHtmlToPdfBuffer(html) {
  const browser = await browserPool.acquire();
  let page;
  try {
    page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "load",
      timeout: 45_000,
    });
    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
      },
    });
    return Buffer.from(pdfData);
  } catch (err) {
    logger.error({ err: err.message }, "billing HTML to PDF failed");
    throw err;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        /* ignore */
      }
    }
    browserPool.release(browser);
  }
}

/**
 * Safe ASCII-ish filename segment for Content-Disposition.
 * @param {string} raw
 */
export function safeBillingFilenamePart(raw) {
  return String(raw || "document")
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
}
