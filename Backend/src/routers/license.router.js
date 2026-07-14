import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, LicenseStatus } from "../prisma/generated/index.js";
import paginateUtil from "../utils/paginate.util.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import deleteLicenseSchema from "../schemas/license/delete-license.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_LICENSE),
  async (req, res) => {
    const request = req.body.request;
    const currentUser = req.context.user;

    // Determine status based on expiry date
    const expiry = new Date(request.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    let status = LicenseStatus.ACTIVE;
    if (daysUntilExpiry < 0) {
      status = LicenseStatus.EXPIRED;
    } else if (daysUntilExpiry <= 30) {
      status = LicenseStatus.EXPIRING_SOON;
    }

    const newLicense = await prisma.license.create({
      data: {
        name: request.name,
        issuer: request.issuer,
        issueDate: new Date(request.issueDate),
        expiryDate: new Date(request.expiryDate),
        certificateNumber: request.certificateNumber,
        documentUrl: request.documentUrl,
        status,
        createdBy: currentUser.id,
      },
    });

    return res.status(201).json({
      message: "License created!",
      data: newLicense,
    });
  },
);

router.get("/", withPermission(Permission.GET_LICENSES), async (req, res) => {
  const licenses = await prisma.license.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      expiryDate: "asc",
    },
    ...paginateUtil.getPaginationParams(req),
  });

  return res.json({
    message: "Licenses fetched!",
    data: licenses,
  });
});

router.get(
  "/:id",
  withPermission(Permission.GET_LICENSES),
  async (req, res) => {
    const { id } = req.params;

    const license = await prisma.license.findUniqueOrThrow({
      where: { id },
    });

    return res.json({
      message: "License fetched!",
      data: license,
    });
  },
);

router.put(
  "/:id",
  withPermission(Permission.UPDATE_LICENSE),
  async (req, res) => {
    const { id } = req.params;
    const request = req.body.request;
    const currentUser = req.context.user;

    // Determine status based on expiry date
    const expiry = new Date(request.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    let status = LicenseStatus.ACTIVE;
    if (daysUntilExpiry < 0) {
      status = LicenseStatus.EXPIRED;
    } else if (daysUntilExpiry <= 30) {
      status = LicenseStatus.EXPIRING_SOON;
    }

    const updatedLicense = await prisma.license.update({
      where: { id },
      data: {
        name: request.name,
        issuer: request.issuer,
        issueDate: request.issueDate ? new Date(request.issueDate) : undefined,
        expiryDate: request.expiryDate
          ? new Date(request.expiryDate)
          : undefined,
        certificateNumber: request.certificateNumber,
        documentUrl: request.documentUrl,
        status,
        updatedBy: currentUser.id,
      },
    });

    return res.json({
      message: "License updated!",
      data: updatedLicense,
    });
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_LICENSE),
  validateRequest(deleteLicenseSchema),
  requireDeletionOTP({ entityType: "License" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    await prisma.license.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({
      message: "License deleted!",
    });
  },
);

export default router;
