/**
 * Canonical region used when no stronger signal exists (name match, admin region, staff votes).
 * Prefer a region with this name in the DB; otherwise the reconciliation picks the first active region
 * alphabetically, or creates this region if none exist.
 */
export const FALLBACK_SCHOOL_REGION_NAME = "General";
