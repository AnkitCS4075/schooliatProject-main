import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import circularService from "../services/circular.service.js";
import createCircularSchema from "../schemas/circular/create-circular.schema.js";
import deleteCircularSchema from "../schemas/circular/delete-circular.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

// Create circular
router.post(
  "/",
  withPermission(Permission.CREATE_CIRCULAR),
  validateRequest(createCircularSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const circular = await circularService.createCircular({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Circular created successfully",
        data: circular,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create circular",
      });
    }
  },
);

// Update circular
router.put(
  "/:id",
  withPermission(Permission.EDIT_CIRCULAR),
  validateRequest(createCircularSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const circular = await circularService.updateCircular(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Circular updated successfully",
        data: circular,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update circular",
      });
    }
  },
);

// Publish circular
router.post(
  "/:id/publish",
  withPermission(Permission.PUBLISH_CIRCULAR),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const circular = await circularService.publishCircular(id, currentUser.id);

      return res.status(200).json({
        message: "Circular published successfully",
        data: circular,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to publish circular",
      });
    }
  },
);

// Get circulars
router.get(
  "/",
  withPermission(Permission.GET_CIRCULARS),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await circularService.getCirculars(
        currentUser.schoolId,
        currentUser.id,
        {
          status: query.status,
        },
        {
          page: parseInt(query.page) || 1,
          limit: parseInt(query.limit) || 20,
        },
      );

      return res.status(200).json({
        message: "Circulars fetched successfully",
        data: result.circulars,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch circulars",
      });
    }
  },
);

// Delete circular
router.delete(
  "/:id",
  withPermission(Permission.DELETE_CIRCULAR),
  validateRequest(deleteCircularSchema),
  requireDeletionOTP({ entityType: "Circular" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.circular.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "Circular deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete circular",
      });
    }
  },
);

export default router;

