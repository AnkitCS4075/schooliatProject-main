import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName, UserType } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createRegionSchema from "../schemas/region/create-region.schema.js";
import updateRegionSchema from "../schemas/region/update-region.schema.js";
import getRegionsSchema from "../schemas/region/get-regions.schema.js";
import deleteRegionSchema from "../schemas/region/delete-region.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_REGION),
  validateRequest(createRegionSchema),
  async (req, res) => {
    const request = req.body.request;
    const currentUser = req.context.user;

    // Validate zone head if provided
    if (request.zoneHeadId) {
      const zoneHead = await prisma.user.findUnique({
        where: { id: request.zoneHeadId, deletedAt: null },
      });
      if (!zoneHead) {
        return res.status(404).json({ message: "Zone Head not found or deleted" });
      }
    }

    const newRegion = await prisma.region.create({
      data: {
        name: request.name,
        zoneHeadId: request.zoneHeadId || null,
        createdBy: currentUser.id,
      },
    });

    return res
      .status(201)
      .json({ message: "Region created!", data: newRegion });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_REGIONS),
  validateRequest(getRegionsSchema),
  async (req, res) => {
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        name: true,
        zoneHeadId: true,
        zoneHead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      where: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    return res.json({ message: "Regions fetched!", data: regions });
  },
);

// PATCH endpoint for editing region
router.patch(
  "/:id",
  withPermission(Permission.EDIT_REGION),
  validateRequest(updateRegionSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    // Check if region exists and is not deleted
    const existingRegion = await prisma.region.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingRegion) {
      return res.status(404).json({ message: "Region not found!" });
    }

    // Validate zone head if provided
    if (updateData.zoneHeadId !== undefined && updateData.zoneHeadId !== null) {
      const zoneHead = await prisma.user.findUnique({
        where: { id: updateData.zoneHeadId, deletedAt: null },
      });
      if (!zoneHead) {
        return res.status(404).json({ message: "Zone Head not found or deleted" });
      }
    }

    // Build update data object with only provided fields
    const regionUpdateData = {};

    if (updateData.name !== undefined) regionUpdateData.name = updateData.name;
    if (updateData.zoneHeadId !== undefined) regionUpdateData.zoneHeadId = updateData.zoneHeadId;

    regionUpdateData.updatedBy = currentUser.id;

    const updatedRegion = await prisma.region.update({
      where: { id },
      data: regionUpdateData,
    });

    return res.json({ message: "Region updated!", data: updatedRegion });
  },
);

// DELETE endpoint for soft deletion of region
router.delete(
  "/:id",
  withPermission(Permission.DELETE_REGION),
  validateRequest(deleteRegionSchema),
  requireDeletionOTP({ entityType: "Region" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingRegion = await prisma.region.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingRegion) {
      return res.status(404).json({ message: "Region not found!" });
    }

    await prisma.region.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Region deleted!" });
  },
);

export default router;
