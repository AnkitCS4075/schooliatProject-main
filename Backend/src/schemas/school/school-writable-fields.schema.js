import { z } from "zod";

/**
 * Shared Zod shapes for School fields that appear in create / super-admin PATCH / forms.
 * Centralizes empty-string → null and optional PATCH semantics (undefined = omit update).
 */

/** PATCH/create optional string columns: omit (undefined), clear (null or ""), or non-empty trimmed value. */
export function optionalNullableTrimmedString() {
  return z.preprocess(
    (val) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      if (typeof val !== "string") return val;
      const t = val.trim();
      return t === "" ? null : t;
    },
    z.union([z.null(), z.string()]).optional(),
  );
}

/**
 * regionId: omit (undefined / ""), assign (uuid), or clear (null).
 * Create treats missing/empty like "no choice" and the router applies default region.
 */
export function optionalSchoolRegionId(message = "Region ID must be a valid UUID") {
  return z.preprocess(
    (v) => {
      if (v === "" || v === undefined) return undefined;
      if (v === null) return null;
      return v;
    },
    z.union([z.null(), z.string().uuid(message)]).optional(),
  );
}

/** Optional school email columns: empty / whitespace → null; valid email string otherwise. */
export function optionalSchoolEmailField(message = "Invalid email") {
  return z.preprocess(
    (val) => {
      if (val === undefined) return undefined;
      if (val === null) return null;
      if (typeof val !== "string") return val;
      const t = val.trim();
      if (t === "") return null;
      return t;
    },
    z.union([z.null(), z.string().email(message)]).optional(),
  );
}

function preprocessOptionalIntFromForm(val, { min, max } = {}) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === "number" && Number.isFinite(val)) {
    const n = Math.trunc(val);
    if (min !== undefined && n < min) return val;
    if (max !== undefined && n > max) return val;
    return n;
  }
  if (typeof val === "string") {
    const t = val.trim();
    if (t === "") return null;
    const n = parseInt(t, 10);
    return Number.isFinite(n) ? n : val;
  }
  return val;
}

/** Established year: form sends string or number; empty → null. */
export function optionalEstablishedYearField() {
  return z.preprocess(
    (val) => preprocessOptionalIntFromForm(val, { min: 1800, max: 2100 }),
    z
      .union([z.null(), z.number().int().min(1800).max(2100)])
      .optional(),
  );
}

/** Student strength: form sends string or number; empty → null. */
export function optionalStudentStrengthField() {
  return z.preprocess(
    (val) => preprocessOptionalIntFromForm(val, { min: 0 }),
    z.union([z.null(), z.number().int().min(0)]).optional(),
  );
}
