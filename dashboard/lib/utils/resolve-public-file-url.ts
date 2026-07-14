import { BASE_URL } from "@/lib/api/config";

/**
 * Canonical URL for loading or opening uploaded files in the browser.
 * - With NEXT_PUBLIC_API_URL set (production): points at the API origin (`https://api…/files/:id`),
 *   so requests never depend on the dashboard host or Next.js rewrites.
 * - With BASE_URL empty (local dev): keeps `/files/:id` so Next rewrites proxy to the backend.
 *
 * Backend may return `/files/:id` or an absolute API URL; both are normalized here.
 */
export function resolvePublicFileUrl(url: string | null | undefined): string {
  if (url == null || url === "") return "";
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = BASE_URL.replace(/\/$/, "");
  if (trimmed.startsWith("/")) return `${base}${trimmed}`;
  return `${base}/${trimmed}`;
}
