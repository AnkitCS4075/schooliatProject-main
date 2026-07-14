import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch, post } from "@/lib/api/client";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => get("/settings"),
    staleTime: 5 * 60 * 1000,
  });
}

/** Platform/company bank details (for schools to pay SchooliAT) */
export function usePlatformBank() {
  return useQuery({
    queryKey: ["settings", "platform-bank"],
    queryFn: async () => {
      const res = await get("/settings/platform-bank");
      return res?.data ?? {};
    },
    staleTime: 5 * 60 * 1000,
  });
}

export type UpdateSettingsRequest = Partial<Settings> & {
  /** Super Admin: set or clear encrypted SMTP password (never stored in platformConfig JSON) */
  platformSmtpPassword?: string | null;
};

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { request: UpdateSettingsRequest }) =>
      patch("/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      post("/auth/change-password", { request: payload }),
  });
}

export interface Settings {
  id: string;
  schoolId: string | null;
  logoId?: string;
  logoUrl?: string;
  studentFeeInstallments?: number;
  studentFeeAmount?: number;
  /** School: where deletion OTP emails are delivered when set */
  deletionOtpEmail?: string | null;
  feeReceiptNumberPrefix?: string | null;
  feeReceiptNextSequence?: number | null;
  feeReceiptUseGst?: boolean;
  feeReceiptCgstPercent?: number | string | null;
  feeReceiptSgstPercent?: number | string | null;
  feeReceiptPanCardNumber?: string | null;
  platformConfig?: PlatformConfig;
  /** Super Admin platform row: encrypted SMTP password exists in DB */
  platformSmtpPasswordConfigured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformConfig {
  // Branding
  branding?: {
    platformName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    faviconId?: string;
  };
  // System
  system?: {
    maintenanceMode?: boolean;
    maintenanceMessage?: string;
    smtp?: {
      /** When true, API uses these credentials instead of SMTP_* environment variables */
      enabled?: boolean;
      host?: string;
      port?: number;
      /** Implicit TLS (typical for port 465) */
      secure?: boolean;
      requireTls?: boolean;
      user?: string;
      fromEmail?: string;
      fromName?: string;
    };
    notifications?: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      smsEnabled?: boolean;
    };
  };
  // Security
  security?: {
    ipWhitelist?: string[];
    global2FA?: boolean;
    passwordPolicy?: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
      preventReuse?: number;
    };
    sessionTimeout?: number; // minutes
    jwtExpiration?: number; // hours
  };
  // Performance
  performance?: {
    cacheEnabled?: boolean;
    cacheTTL?: number; // seconds
    paginationDefault?: number;
    fileUploadLimit?: number; // MB
    queryTimeout?: number; // seconds
  };
  // Audit
  audit?: {
    retentionDays?: number;
    logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR";
    enableActivityTracking?: boolean;
  };
  // AI
  ai?: {
    chatbotEnabled?: boolean;
    conversationRetentionDays?: number;
    responseConfig?: {
      maxTokens?: number;
      temperature?: number;
    };
  };
  // Payment & Bank Details
  platformBank?: {
    companyName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    upiId?: string;
  };
  // Features
  features?: {
    [key: string]: boolean;
  };
  // School-level preferences (used when settings.schoolId is set)
  school?: SchoolConfig;
}

export interface SchoolConfig {
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  notifications?: {
    feeReminders?: boolean;
    attendanceAlerts?: boolean;
    homeworkReminders?: boolean;
    circulars?: boolean;
  };
}

