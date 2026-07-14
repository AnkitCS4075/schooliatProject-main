"use client";

import { post } from "@/lib/api/client";
import type { SuperAdminDeletionEntityType } from "@/lib/super-admin/deletion-entity-types";

export interface DeletionOtpRequestResponse {
  message?: string;
  data?: {
    otpId?: string;
    expiresAt?: string;
    message?: string;
  };
}

export function requestDeletionOtp(entityType: string, entityId: string) {
  return post("/deletion-otp/request", {
    request: { entityType, entityId },
  }) as Promise<DeletionOtpRequestResponse>;
}

/** @deprecated Use requestDeletionOtp */
export function requestSuperAdminDeletionOtp(
  entityType: SuperAdminDeletionEntityType,
  entityId: string,
) {
  return requestDeletionOtp(entityType, entityId);
}
