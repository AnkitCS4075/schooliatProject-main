/** Must match strings passed to `POST /deletion-otp/request` (used in notification email). */
export const SUPER_ADMIN_DELETION_ENTITY = {
  SCHOOL: "School",
  REGION: "Region",
  LOCATION: "Location",
  VENDOR: "Vendor",
  LICENSE: "License",
  INVOICE: "Invoice",
} as const;

export type SuperAdminDeletionEntityType =
  (typeof SUPER_ADMIN_DELETION_ENTITY)[keyof typeof SUPER_ADMIN_DELETION_ENTITY];
