import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import idCardService from "../services/id-card.service.js";
import upsertConfigSchema from "../schemas/id-card/upsert-config.schema.js";
import generateIdCardsSchema from "../schemas/id-card/generate-id-cards.schema.js";
import getIdCardsSchema from "../schemas/id-card/get-id-cards.schema.js";
import fileService from "../services/file.service.js";
import { idCardGenerationRateLimit } from "../middlewares/rate-limit.middleware.js";

const router = Router();

// Get ID cards overview
router.get(
  "/",
  withPermission(Permission.GET_ID_CARDS),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res.json({
        message: "ID cards overview - school context required",
        data: {
          endpoints: {
            status: "/id-cards/status",
            config: "/id-cards/config",
            generate: "/id-cards/classes/:classId/generate",
          },
          note: "These endpoints require school context. Use a school admin account or provide schoolId.",
        },
      });
    }

    try {
      const [classesWithCollections, idCardConfig] = await Promise.all([
        idCardService.getClassesWithCollectionStatus(schoolId),
        idCardService.fetchIdCardConfig(schoolId),
      ]);

      return res.json({
        message: "ID cards overview fetched!",
        data: {
          classes: classesWithCollections,
          config: idCardConfig,
          endpoints: {
            status: "/id-cards/status",
            config: "/id-cards/config",
            generate: "/id-cards/classes/:classId/generate",
          },
        },
      });
    } catch (err) {
      return res.status(200).json({
        message: "ID cards overview - config not ready",
        data: {
          classes: [],
          config: null,
          endpoints: {
            status: "/id-cards/status",
            config: "/id-cards/config",
            generate: "/id-cards/classes/:classId/generate",
          },
        },
      });
    }
  },
);

// Get all classes with their ID card collection status for current year
router.get(
  "/status",
  withPermission(Permission.GET_ID_CARDS),
  validateRequest(getIdCardsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res.json({
        message: "ID card status - school context required",
        data: {
          note: "This endpoint requires school context. Use a school admin account or provide schoolId.",
        },
      });
    }

    const classesWithCollections =
      await idCardService.getClassesWithCollectionStatus(schoolId);

    return res.json({
      message: "ID card classes fetched!",
      data: classesWithCollections,
    });
  },
);

// Get ID card config for current year
router.get(
  "/config",
  withPermission(Permission.GET_ID_CARDS),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res.json({
        message: "ID card config - school context required",
        data: {
          note: "This endpoint requires school context. Use a school admin account or provide schoolId.",
        },
      });
    }

    const idCardConfig = await idCardService.fetchIdCardConfig(schoolId);

    if (!idCardConfig) {
      return res
        .status(404)
        .json({ message: "ID card config not found for this school" });
    }

    return res.json({
      message: "ID card config fetched successfully!",
      data: idCardConfig,
    });
  },
);

// Create or update ID card config for current year
router.post(
  "/config",
  withPermission(Permission.MANAGE_ID_CARD_CONFIG),
  validateRequest(upsertConfigSchema),
  async (req, res) => {
    const { templateId, config } = req.body.request;
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school" });
    }

    const idCardConfig = await idCardService.upsertIdCardConfig(
      schoolId,
      templateId,
      config,
      currentUser.id,
    );

    return res.json({
      message: "ID card config saved successfully!",
      data: idCardConfig,
    });
  },
);

// Generate ID cards for a class
router.post(
  "/classes/:classId/generate",
  idCardGenerationRateLimit, // Rate limit for resource-intensive operation
  withPermission(Permission.GENERATE_ID_CARDS),
  validateRequest(generateIdCardsSchema),
  async (req, res) => {
    const { classId } = req.params;
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school" });
    }

    // Verify class belongs to user's school
    const classEntity = await prisma.class.findFirst({
      where: { id: classId, schoolId, deletedAt: null },
    });

    if (!classEntity) {
      return res
        .status(404)
        .json({ message: "Class not found or does not belong to your school" });
    }

    const result = await idCardService.generateIdCardsForClass(
      classId,
      schoolId,
      currentUser.id,
    );

    return res.json({
      message: `ID cards generated successfully for ${result.totalGenerated} students!`,
      data: {
        studentFileIdMap: result.studentFileMap,
        zipFileId: result.zipFileId,
        totalGenerated: result.totalGenerated,
        zipFileUrl: fileService.attachFileURL({
          id: result.zipFileId,
          extension: "zip",
        }).url,
      },
    });
  },
);

export default router;
