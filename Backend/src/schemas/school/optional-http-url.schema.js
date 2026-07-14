import { z } from "zod";

/**
 * Optional URL fields stored as String? in Prisma (e.g. certificateLink).
 *
 * - Key omitted / undefined → undefined (field not updated when used in PATCH partial objects)
 * - null → null (explicit clear)
 * - "" or whitespace-only → null (forms always send strings for empty inputs)
 * - Non-empty string → trimmed; must be a valid URL
 *
 * This avoids the common Zod pitfall where `.url().optional()` still rejects `""` because
 * optional only skips `undefined`, not empty string.
 */
export function optionalNullableHttpUrl(message = "Must be a valid URL") {
  return z.preprocess(
    (val) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      if (typeof val !== "string") return val;
      const t = val.trim();
      if (t === "") return null;
      return t;
    },
    z.union([z.null(), z.string().url(message)]).optional(),
  );
}
