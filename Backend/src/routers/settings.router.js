import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import { RoleName } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import getSettingsSchema from "../schemas/settings/get-settings.schema.js";
import updateSettingsSchema from "../schemas/settings/update-settings.schema.js";
import fileService from "../services/file.service.js";
import authorize from "../middlewares/authorize.middleware.js";
import {
  sanitizeSettingsForApiResponse,
  stripSmtpPasswordFromPlatformConfig,
} from "../utils/settings-platform-config.util.js";
import {
  encryptPlatformSmtpPassword,
  isPlatformSmtpEncryptionConfigured,
} from "../utils/platform-smtp-crypto.util.js";
import emailService from "../services/email.service.js";

const router = Router();

// GET settings - Platform settings for SUPER_ADMIN, School settings for SCHOOL_ADMIN
router.get(
  "/",
  withPermission(Permission.GET_SETTINGS),
  validateRequest(getSettingsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const userRole = currentUser.role?.name;

    // Determine if this is platform settings (SUPER_ADMIN) or school settings (SCHOOL_ADMIN)
    const isPlatformSettings = userRole === RoleName.SUPER_ADMIN;
    const targetSchoolId = isPlatformSettings ? null : currentUser.schoolId;

    if (!isPlatformSettings && !currentUser.schoolId) {
      return res.json({
        message: "Settings - school context required",
        data: {
          note: "Settings endpoint requires school context. Use a school admin account or provide schoolId.",
        },
      });
    }

    try {
      const settings = await prisma.settings.findFirst({
        where: {
          schoolId: targetSchoolId,
          deletedAt: null,
        },
      });

      let logoUrl = null;
      if (settings?.logoId) {
        const logoFile = await fileService.getFileById(settings.logoId);
        if (logoFile) {
          logoUrl = fileService.attachFileURL(logoFile).url;
        }
      }

      // Handle platformConfig field safely (may not exist if migration not applied)
      let settingsData = settings;
      if (settings) {
        settingsData = { ...settings };
        // Only include platformConfig if it exists (migration applied)
        if (settingsData.platformConfig === undefined) {
          // Field doesn't exist yet, don't include it
          delete settingsData.platformConfig;
        }
      }

      const payload = settingsData ? { ...settingsData, logoUrl } : null;
      return res.json({
        message: "Settings fetched!",
        data: payload ? sanitizeSettingsForApiResponse(payload) : null,
      });
    } catch (error) {
      // If error is due to platformConfig column not existing (migration not applied),
      // try querying without that field using raw SQL
      if (error.message && (error.message.includes('platform_config') || error.message.includes('column') || error.code === '42703')) {
        try {
          // Use raw query to exclude platformConfig column
          let rawSettings;
          if (targetSchoolId === null) {
            rawSettings = await prisma.$queryRaw`
              SELECT id, school_id, student_fee_installments, student_fee_amount, 
                     current_installement_number, logo_id, created_by, updated_by, 
                     deleted_by, created_at, updated_at, deleted_at
              FROM settings
              WHERE school_id IS NULL
              AND deleted_at IS NULL
              LIMIT 1
            `;
          } else {
            rawSettings = await prisma.$queryRaw`
              SELECT id, school_id, student_fee_installments, student_fee_amount, 
                     current_installement_number, logo_id, created_by, updated_by, 
                     deleted_by, created_at, updated_at, deleted_at
              FROM settings
              WHERE school_id = ${targetSchoolId}
              AND deleted_at IS NULL
              LIMIT 1
            `;
          }

          const settings = rawSettings[0] || null;

          let logoUrl = null;
          if (settings?.logo_id) {
            const logoFile = await fileService.getFileById(settings.logo_id);
            if (logoFile) {
              logoUrl = fileService.attachFileURL(logoFile).url;
            }
          }

          // Map raw query result to expected format
          const settingsData = settings ? {
            id: settings.id,
            schoolId: settings.school_id,
            studentFeeInstallments: settings.student_fee_installments,
            studentFeeAmount: settings.student_fee_amount,
            currentInstallmentNumber: settings.current_installement_number,
            logoId: settings.logo_id,
            createdBy: settings.created_by,
            updatedBy: settings.updated_by,
            deletedBy: settings.deleted_by,
            createdAt: settings.created_at,
            updatedAt: settings.updated_at,
            deletedAt: settings.deleted_at,
            logoUrl,
          } : null;

          return res.json({
            message: "Settings fetched!",
            data: settingsData ? sanitizeSettingsForApiResponse(settingsData) : null,
          });
        } catch (rawError) {
          console.error("Error fetching settings (raw query):", rawError);
          return res.status(500).json({
            message: "Failed to fetch settings",
            error: rawError.message,
          });
        }
      }

      // Log error for debugging
      console.error("Error fetching settings:", error);
      return res.status(500).json({
        message: "Failed to fetch settings",
        error: error.message,
      });
    }
  },
);

// GET /settings/platform-bank – platform/company bank details for schools (e.g. where to pay)
router.get(
  "/platform-bank",
  authorize,
  async (req, res) => {
    try {
      const platformSettings = await prisma.settings.findFirst({
        where: { schoolId: null, deletedAt: null },
      });
      let config = platformSettings?.platformConfig;
      if (config === undefined || config === null) {
        try {
          const raw = await prisma.$queryRaw`SELECT platform_config FROM settings WHERE school_id IS NULL AND deleted_at IS NULL LIMIT 1`;
          config = raw[0]?.platform_config;
        } catch (e) {
          // ignore
        }
      }
      const bank = config?.platformBank || config?.bankDetails || {};
      return res.json({
        message: "Platform bank details",
        data: bank,
      });
    } catch (error) {
      console.error("Error fetching platform bank:", error);
      return res.status(500).json({
        message: "Failed to fetch platform bank",
        error: error.message,
      });
    }
  },
);

// GET /settings/content/:slug – fetch platform-level content (Terms, Privacy, Support)
router.get(
  "/content/:slug",
  authorize,
  async (req, res) => {
    const { slug } = req.params;

    try {
      const platformSettings = await prisma.settings.findFirst({
        where: {
          schoolId: null,
          deletedAt: null,
        },
      });

      if (!platformSettings) {
        return res.status(404).json({
          errorCode: "SETTINGS_NOT_FOUND",
          message: "Platform settings not found",
        });
      }

      // Handle raw config if field doesn't exist in Prisma model yet
      let config = platformSettings.platformConfig;

      // If platformConfig is null/undefined, try finding it via raw query if migration might be missing
      if (config === undefined || config === null) {
        try {
          const raw = await prisma.$queryRaw`SELECT platform_config FROM settings WHERE school_id IS NULL AND deleted_at IS NULL LIMIT 1`;
          config = raw[0]?.platform_config;
        } catch (e) {
          // Ignore raw query error
        }
      }

      if (!config || !config[slug]) {
        return res.status(404).json({
          errorCode: "CONTENT_NOT_FOUND",
          message: `Content for '${slug}' not found`,
        });
      }

      return res.json({
        message: "Content fetched successfully",
        data: config[slug],
      });
    } catch (error) {
      console.error(`Error fetching content for ${slug}:`, error);
      return res.status(500).json({
        message: "Failed to fetch content",
        error: error.message,
      });
    }
  },
);

// PATCH settings - Platform settings for SUPER_ADMIN, School settings for SCHOOL_ADMIN
router.patch(
  "/",
  withPermission(Permission.EDIT_SETTINGS),
  validateRequest(updateSettingsSchema),
  async (req, res) => {
    const updateData = req.body.request || {};
    const currentUser = req.context.user;
    const userRole = currentUser.role?.name;

    // Determine if this is platform settings (SUPER_ADMIN) or school settings (SCHOOL_ADMIN)
    const isPlatformSettings = userRole === RoleName.SUPER_ADMIN;
    const targetSchoolId = isPlatformSettings ? null : currentUser.schoolId;

    if (!isPlatformSettings && !currentUser.schoolId) {
      return res.json({
        message: "Settings - school context required",
        data: {
          note: "Settings endpoint requires school context. Use a school admin account or provide schoolId.",
        },
      });
    }

    // Check if settings exist
    const existingSettings = await prisma.settings.findFirst({
      where: {
        schoolId: targetSchoolId,
        deletedAt: null,
      },
    });

    let resultSettings;

    if (!existingSettings) {
      // Create new settings with defaults and apply provided values
      const createData = {
        schoolId: targetSchoolId,
        studentFeeInstallments: updateData.studentFeeInstallments ?? 12,
        studentFeeAmount: updateData.studentFeeAmount ?? 0,
        currentInstallmentNumber: updateData.currentInstallmentNumber ?? 1,
        logoId: updateData.logoId ?? null,
        createdBy: currentUser.id,
      };

      if (!isPlatformSettings && updateData.deletionOtpEmail !== undefined) {
        const v = updateData.deletionOtpEmail;
        createData.deletionOtpEmail =
          v === null || v === "" ? null : String(v).trim();
      }

      // Only include platformConfig if provided (migration may not be applied yet)
      if (updateData.platformConfig !== undefined) {
        createData.platformConfig = stripSmtpPasswordFromPlatformConfig(
          updateData.platformConfig,
        );
      }

      if (isPlatformSettings && updateData.platformSmtpPassword !== undefined) {
        const raw = updateData.platformSmtpPassword;
        if (raw === null || raw === "") {
          createData.platformSmtpPasswordEnc = null;
        } else if (String(raw).length > 0) {
          if (!isPlatformSmtpEncryptionConfigured()) {
            return res.status(400).json({
              message:
                "PLATFORM_EMAIL_ENCRYPTION_KEY must be set on the server before saving an SMTP password from the admin UI.",
            });
          }
          try {
            createData.platformSmtpPasswordEnc = encryptPlatformSmtpPassword(String(raw));
          } catch (e) {
            return res.status(400).json({
              message: e.message || "Failed to encrypt SMTP password",
            });
          }
        }
      }

      resultSettings = await prisma.settings.create({
        data: createData,
      });

      let logoUrl = null;
      if (resultSettings.logoId) {
        const logoFile = await fileService.getFileById(resultSettings.logoId);
        if (logoFile) {
          logoUrl = fileService.attachFileURL(logoFile).url;
        }
      }

      emailService.resetEmailTransporter();

      return res.status(201).json({
        message: "Settings created!",
        data: sanitizeSettingsForApiResponse({ ...resultSettings, logoUrl }),
      });
    }

    // Build update data object with only provided fields
    const settingsUpdateData = {};

    if (updateData.studentFeeInstallments !== undefined) {
      settingsUpdateData.studentFeeInstallments =
        updateData.studentFeeInstallments;
    }
    if (updateData.studentFeeAmount !== undefined) {
      settingsUpdateData.studentFeeAmount = updateData.studentFeeAmount;
    }
    if (updateData.currentInstallmentNumber !== undefined) {
      settingsUpdateData.currentInstallmentNumber =
        updateData.currentInstallmentNumber;
    }
    if (updateData.logoId !== undefined) {
      settingsUpdateData.logoId = updateData.logoId;
    }
    if (updateData.platformConfig !== undefined) {
      // Merge with existing platform config if it exists
      // Handle case where platformConfig field might not exist yet (migration not applied)
      let existingConfig = {};
      if (existingSettings.platformConfig !== undefined && existingSettings.platformConfig !== null) {
        existingConfig = existingSettings.platformConfig;
      }
      const base = stripSmtpPasswordFromPlatformConfig(existingConfig);
      const incoming = stripSmtpPasswordFromPlatformConfig(updateData.platformConfig);
      settingsUpdateData.platformConfig = {
        ...base,
        ...incoming,
      };
    }

    if (isPlatformSettings && updateData.platformSmtpPassword !== undefined) {
      const raw = updateData.platformSmtpPassword;
      if (raw === null || raw === "") {
        settingsUpdateData.platformSmtpPasswordEnc = null;
      } else if (String(raw).length > 0) {
        if (!isPlatformSmtpEncryptionConfigured()) {
          return res.status(400).json({
            message:
              "PLATFORM_EMAIL_ENCRYPTION_KEY must be set on the server before saving an SMTP password from the admin UI.",
          });
        }
        try {
          settingsUpdateData.platformSmtpPasswordEnc = encryptPlatformSmtpPassword(String(raw));
        } catch (e) {
          return res.status(400).json({
            message: e.message || "Failed to encrypt SMTP password",
          });
        }
      }
    }

    if (updateData.deletionOtpEmail !== undefined) {
      if (isPlatformSettings) {
        return res.status(400).json({
          message: "deletionOtpEmail can only be set for school settings",
        });
      }
      const v = updateData.deletionOtpEmail;
      settingsUpdateData.deletionOtpEmail =
        v === null || v === "" ? null : String(v).trim();
    }

    if (!isPlatformSettings) {
      if (updateData.feeReceiptNumberPrefix !== undefined) {
        settingsUpdateData.feeReceiptNumberPrefix =
          String(updateData.feeReceiptNumberPrefix).trim() || "REC";
      }
      if (updateData.feeReceiptNextSequence !== undefined) {
        settingsUpdateData.feeReceiptNextSequence =
          updateData.feeReceiptNextSequence;
      }
      if (updateData.feeReceiptUseGst !== undefined) {
        settingsUpdateData.feeReceiptUseGst = updateData.feeReceiptUseGst;
      }
      if (updateData.feeReceiptCgstPercent !== undefined) {
        settingsUpdateData.feeReceiptCgstPercent =
          updateData.feeReceiptCgstPercent;
      }
      if (updateData.feeReceiptSgstPercent !== undefined) {
        settingsUpdateData.feeReceiptSgstPercent =
          updateData.feeReceiptSgstPercent;
      }
      if (updateData.feeReceiptPanCardNumber !== undefined) {
        const p = updateData.feeReceiptPanCardNumber;
        settingsUpdateData.feeReceiptPanCardNumber =
          p === null || p === "" ? null : String(p).trim();
      }
    }

    settingsUpdateData.updatedBy = currentUser.id;

    try {
      resultSettings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: settingsUpdateData,
      });
    } catch (error) {
      // If error is due to platformConfig field not existing (migration not applied),
      // retry without platformConfig
      if (error.message && error.message.includes('platform_config')) {
        delete settingsUpdateData.platformConfig;
        resultSettings = await prisma.settings.update({
          where: { id: existingSettings.id },
          data: settingsUpdateData,
        });
      } else {
        throw error;
      }
    }

    let logoUrl = null;
    if (resultSettings.logoId) {
      const logoFile = await fileService.getFileById(resultSettings.logoId);
      if (logoFile) {
        logoUrl = fileService.attachFileURL(logoFile).url;
      }
    }

    emailService.resetEmailTransporter();

    return res.json({
      message: "Settings updated!",
      data: sanitizeSettingsForApiResponse({ ...resultSettings, logoUrl }),
    });
  },
);

export default router;
