import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import {
  Permission,
  RoleName,
  UserType,
  LeadStatus,
} from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createVendorSchema from "../schemas/vendor/create-vendor.schema.js";
import updateVendorSchema from "../schemas/vendor/update-vendor.schema.js";
import getVendorsSchema from "../schemas/vendor/get-vendors.schema.js";
import deleteVendorSchema from "../schemas/vendor/delete-vendor.schema.js";
import roleService from "../services/role.service.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

// Get vendor statistics by status
router.get(
  "/stats",
  withPermission(Permission.GET_VENDORS),
  async (req, res) => {
    const currentUser = req.context.user;
    const role = await roleService.getRoleByName(RoleName.EMPLOYEE);

    // If user is an employee, only count vendors assigned to their region
    const isEmployee = currentUser.roleId === role?.id;

    const whereClause = {
      deletedAt: null,
      deletedBy: null,
    };

    if (isEmployee && currentUser.assignedRegionId) {
      whereClause.regionId = currentUser.assignedRegionId;
    }

    const [
      newCount,
      hotCount,
      coldCount,
      followUpCount,
      convertedCount,
      totalCount,
    ] = await Promise.all([
      prisma.vendor.count({
        where: { ...whereClause, status: LeadStatus.NEW },
      }),
      prisma.vendor.count({
        where: { ...whereClause, status: LeadStatus.HOT },
      }),
      prisma.vendor.count({
        where: { ...whereClause, status: LeadStatus.COLD },
      }),
      prisma.vendor.count({
        where: { ...whereClause, status: LeadStatus.FOLLOW_UP },
      }),
      prisma.vendor.count({
        where: { ...whereClause, status: LeadStatus.CONVERTED },
      }),
      prisma.vendor.count({ where: whereClause }),
    ]);

    return res.json({
      message: "Vendor statistics fetched!",
      data: {
        total: totalCount,
        new: newCount,
        hot: hotCount,
        cold: coldCount,
        followUp: followUpCount,
        converted: convertedCount,
      },
    });
  },
);

router.post(
  "/",
  withPermission(Permission.CREATE_VENDOR),
  validateRequest(createVendorSchema),
  async (req, res) => {
    const request = req.body.request;
    const currentUser = req.context.user;

    const newVendor = await prisma.vendor.create({
      data: {
        name: request.name,
        email: request.email,
        contact: request.contact,
        address: request.address,
        status: LeadStatus.NEW,
        regionId: request.regionId,
        employeeId: request.employeeId,
        comments: request.comments,
        createdBy: currentUser.id,
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Vendor created!", data: newVendor });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_VENDORS),
  validateRequest(getVendorsSchema),
  async (req, res) => {
    const { employeeId, regionId, status, search } = req.query;
    const currentUser = req.context.user;
    const role = await roleService.getRoleByName(RoleName.EMPLOYEE);

    const whereClause = {
      deletedAt: null,
      deletedBy: null,
    };

    // If user is an employee, only show vendors from their assigned region
    const isEmployee = currentUser.roleId === role?.id;
    if (isEmployee && currentUser.assignedRegionId) {
      whereClause.regionId = currentUser.assignedRegionId;
    } else {
      // For super admin, allow filtering by employeeId or regionId
      if (employeeId) {
        whereClause.employeeId = employeeId;
      } else if (regionId) {
        whereClause.regionId = regionId;
      }
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contact: { contains: search, mode: "insensitive" } },
      ];
    }

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      include: {
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ message: "Vendors fetched!", data: vendors });
  },
);

// Get single vendor by ID
router.get("/:id", withPermission(Permission.GET_VENDORS), async (req, res) => {
  const { id } = req.params;

  const vendor = await prisma.vendor.findUnique({
    where: { id, deletedAt: null, deletedBy: null },
    include: {
      region: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!vendor) {
    return res.status(404).json({ message: "Vendor not found!" });
  }

  return res.json({ message: "Vendor fetched!", data: vendor });
});

// PATCH endpoint for editing vendor
router.patch(
  "/:id",
  withPermission(Permission.EDIT_VENDOR),
  validateRequest(updateVendorSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    // Check if vendor exists and is not deleted
    const existingVendor = await prisma.vendor.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingVendor) {
      return res.status(404).json({ message: "Vendor not found!" });
    }

    // Validate region exists and is not deleted if provided
    if (updateData.regionId != null) {
      const regionEntity = await prisma.region.findFirst({
        where: {
          id: updateData.regionId,
          deletedAt: null,
          deletedBy: null,
        },
      });
      if (!regionEntity) {
        return res
          .status(404)
          .json({ message: "Region not found or deleted!" });
      }
    }

    // Build update data object with only provided fields
    const vendorUpdateData = {};

    if (updateData.name !== undefined) vendorUpdateData.name = updateData.name;
    if (updateData.email !== undefined)
      vendorUpdateData.email = updateData.email;
    if (updateData.contact !== undefined)
      vendorUpdateData.contact = updateData.contact;
    if (updateData.address !== undefined)
      vendorUpdateData.address = updateData.address;
    if (updateData.status !== undefined)
      vendorUpdateData.status = updateData.status;
    if (updateData.comments !== undefined)
      vendorUpdateData.comments = updateData.comments;
    if (updateData.regionId !== undefined)
      vendorUpdateData.regionId = updateData.regionId;
    if (updateData.employeeId !== undefined)
      vendorUpdateData.employeeId = updateData.employeeId;

    vendorUpdateData.updatedBy = currentUser.id;

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: vendorUpdateData,
      include: {
        region: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({ message: "Vendor updated!", data: updatedVendor });
  },
);

// DELETE endpoint for soft deletion of vendor
router.delete(
  "/:id",
  withPermission(Permission.DELETE_VENDOR),
  validateRequest(deleteVendorSchema),
  requireDeletionOTP({ entityType: "Vendor" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingVendor = await prisma.vendor.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingVendor) {
      return res.status(404).json({ message: "Vendor not found!" });
    }

    await prisma.vendor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Vendor deleted!" });
  },
);

export default router;
