/**
 * Single source of truth for API base URL.
 * - When NEXT_PUBLIC_API_URL is set (e.g. production/staging): use it.
 * - When unset in dev: use "" so requests are same-origin and go through
 *   Next.js rewrites (next.config.js) to the backend. Rewrites target port 4000.
 */
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
