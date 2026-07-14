import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createTransportSchema from "../schemas/transport/create-transport.schema.js";
import updateTransportSchema from "../schemas/transport/update-transport.schema.js";
import getTransportsSchema from "../schemas/transport/get-transports.schema.js";
import deleteTransportSchema from "../schemas/transport/delete-transport.schema.js";
import { bulkDeleteTransportsSchema } from "../schemas/transport/bulk-delete-transports.schema.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import otpDeletionService from "../services/otp-deletion.service.js";
import { resolveDeletionOtpRecipientEmail } from "../services/deletion-otp-recipient.service.js";
import transportEnhancedService from "../services/transport-enhanced.service.js";
import createRouteSchema from "../schemas/transport/create-route.schema.js";
import addStopSchema from "../schemas/transport/add-stop.schema.js";

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_TRANSPORT),
  validateRequest(createTransportSchema),
  async (req, res) => {
    const request = req.body.request;
    const currentUser = req.context.user;

    const newTransport = await prisma.transport.create({
      data: {
        type: request.type,
        ownerFirstName: request.ownerFirstName,
        ownerLastName: request.ownerLastName,
        driverFirstName: request.driverFirstName,
        driverLastName: request.driverLastName,
        driverDateOfBirth: new Date(request.driverDateOfBirth),
        driverContact: request.driverContact,
        driverGender: request.driverGender,
        driverPhotoLink: request.driverPhotoLink,
        conductorFirstName: request.conductorFirstName,
        conductorLastName: request.conductorLastName,
        conductorDateOfBirth: new Date(request.conductorDateOfBirth),
        conductorContact: request.conductorContact,
        conductorGender: request.conductorGender,
        conductorPhotoLink: request.conductorPhotoLink,
        licenseNumber: request.licenseNumber,
        vehicleNumber: request.vehicleNumber,
        busSerialNumber: request.busSerialNumber || null,
        createdBy: currentUser.id,
        schoolId: currentUser.schoolId,
      },
    });

    return res
      .status(201)
      .json({ message: "Transport created!", data: newTransport });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_TRANSPORTS),
  validateRequest(getTransportsSchema),
  async (req, res) => {
    const currentUser = req.context.user;

    const transports = await prisma.transport.findMany({
      where: {
        schoolId: currentUser.schoolId || null,
        deletedAt: null,
        deletedBy: null,
      },
    });

    return res.json({ message: "Transports fetched!", data: transports });
  },
);

router.patch(
  "/:id",
  withPermission(Permission.EDIT_TRANSPORT),
  validateRequest(updateTransportSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    // Check if transport exists and is not deleted
    const existingTransport = await prisma.transport.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingTransport) {
      return res.status(404).json({ message: "Transport not found!" });
    }

    // Build update data object with only provided fields
    const transportUpdateData = {};

    if (updateData.type !== undefined)
      transportUpdateData.type = updateData.type;
    if (updateData.ownerFirstName !== undefined)
      transportUpdateData.ownerFirstName = updateData.ownerFirstName;
    if (updateData.ownerLastName !== undefined)
      transportUpdateData.ownerLastName = updateData.ownerLastName;
    if (updateData.driverFirstName !== undefined)
      transportUpdateData.driverFirstName = updateData.driverFirstName;
    if (updateData.driverLastName !== undefined)
      transportUpdateData.driverLastName = updateData.driverLastName;
    if (updateData.driverDateOfBirth !== undefined)
      transportUpdateData.driverDateOfBirth = new Date(
        updateData.driverDateOfBirth,
      );
    if (updateData.driverContact !== undefined)
      transportUpdateData.driverContact = updateData.driverContact;
    if (updateData.driverGender !== undefined)
      transportUpdateData.driverGender = updateData.driverGender;
    if (updateData.driverPhotoLink !== undefined)
      transportUpdateData.driverPhotoLink = updateData.driverPhotoLink;
    if (updateData.conductorFirstName !== undefined)
      transportUpdateData.conductorFirstName = updateData.conductorFirstName;
    if (updateData.conductorLastName !== undefined)
      transportUpdateData.conductorLastName = updateData.conductorLastName;
    if (updateData.conductorDateOfBirth !== undefined)
      transportUpdateData.conductorDateOfBirth = updateData.conductorDateOfBirth
        ? new Date(updateData.conductorDateOfBirth)
        : null;
    if (updateData.conductorContact !== undefined)
      transportUpdateData.conductorContact = updateData.conductorContact;
    if (updateData.conductorGender !== undefined)
      transportUpdateData.conductorGender = updateData.conductorGender;
    if (updateData.conductorPhotoLink !== undefined)
      transportUpdateData.conductorPhotoLink = updateData.conductorPhotoLink;
    if (updateData.licenseNumber !== undefined)
      transportUpdateData.licenseNumber = updateData.licenseNumber;
    if (updateData.vehicleNumber !== undefined)
      transportUpdateData.vehicleNumber = updateData.vehicleNumber;
    if (updateData.busSerialNumber !== undefined)
      transportUpdateData.busSerialNumber = updateData.busSerialNumber || null;

    transportUpdateData.updatedBy = currentUser.id;

    const updatedTransport = await prisma.transport.update({
      where: { id },
      data: transportUpdateData,
    });

    return res.json({ message: "Transport updated!", data: updatedTransport });
  },
);

router.post(
  "/bulk-delete",
  withPermission(Permission.DELETE_TRANSPORT),
  validateRequest(bulkDeleteTransportsSchema),
  async (req, res) => {
    try {
      const { otp, transportIds } = req.body.request;
      const currentUser = req.context.user;
      const recipient = await resolveDeletionOtpRecipientEmail(currentUser);
      if (!recipient) {
        return res.status(400).json({ message: "No email available for deletion verification" });
      }
      const ok = await otpDeletionService.verifyDeletionOTP({
        otpRecipientEmail: recipient,
        otpCode: String(otp).trim(),
        entityType: "Transport",
        entityId: `bulk:${transportIds.length}`,
      });
      if (!ok) {
        return res.status(403).json({
          message:
            "Invalid or expired OTP. Request a new verification code and try again.",
          errorCode: "DELETION_OTP_INVALID",
        });
      }

      const result = await prisma.transport.updateMany({
        where: {
          id: { in: transportIds },
          schoolId: currentUser.schoolId,
          deletedAt: null,
          deletedBy: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({
        message: `${result.count} transport(s) deleted`,
        data: { count: result.count },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk delete transports",
      });
    }
  },
);

// DELETE endpoint for soft deletion of transport
router.delete(
  "/:id",
  withPermission(Permission.DELETE_TRANSPORT),
  validateRequest(deleteTransportSchema),
  requireDeletionOTP({ entityType: "Transport" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingTransport = await prisma.transport.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingTransport) {
      return res.status(404).json({ message: "Transport not found!" });
    }

    await prisma.transport.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Transport deleted!" });
  },
);

// ============================================
// PHASE 2: Transport Enhancements
// ============================================

// Create route
router.post(
  "/routes",
  withPermission(Permission.MANAGE_ROUTES),
  validateRequest(createRouteSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const route = await transportEnhancedService.createRoute({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Route created successfully",
        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create route",
      });
    }
  },
);

// Get routes
router.get(
  "/routes",
  withPermission(Permission.GET_ROUTES),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await transportEnhancedService.getRoutes(
        currentUser.schoolId,
        {
          transportId: query.transportId,
          isActive: query.isActive !== undefined ? query.isActive === "true" : undefined,
        },
        {
          page: parseInt(query.page) || 1,
          limit: parseInt(query.limit) || 20,
        },
      );

      return res.status(200).json({
        message: "Routes fetched successfully",
        data: result.routes,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch routes",
      });
    }
  },
);

// Update route
router.put(
  "/routes/:id",
  withPermission(Permission.MANAGE_ROUTES),
  validateRequest(createRouteSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const route = await transportEnhancedService.updateRoute(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Route updated successfully",
        data: route,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update route",
      });
    }
  },
);

// Delete route
router.delete(
  "/routes/:id",
  withPermission(Permission.MANAGE_ROUTES),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "TransportRoute" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.route.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "Route deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete route",
      });
    }
  },
);

// Add route stop
router.post(
  "/routes/stops",
  withPermission(Permission.MANAGE_ROUTES),
  validateRequest(addStopSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const stop = await transportEnhancedService.addRouteStop({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Route stop added successfully",
        data: stop,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to add route stop",
      });
    }
  },
);

// Update route stop
router.put(
  "/routes/stops/:id",
  withPermission(Permission.MANAGE_ROUTES),
  validateRequest(addStopSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const stop = await transportEnhancedService.updateRouteStop(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Route stop updated successfully",
        data: stop,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update route stop",
      });
    }
  },
);

// Delete route stop
router.delete(
  "/routes/stops/:id",
  withPermission(Permission.MANAGE_ROUTES),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.routeStop.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "Route stop deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete route stop",
      });
    }
  },
);

// Assign student to route
router.post(
  "/routes/:routeId/students/:studentId",
  withPermission(Permission.ASSIGN_STUDENTS_TO_ROUTE),
  async (req, res) => {
    try {
      const { routeId, studentId } = req.params;

      await transportEnhancedService.assignStudentToRoute(routeId, studentId);

      return res.status(200).json({
        message: "Student assigned to route successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to assign student to route",
      });
    }
  },
);

// Get route students
router.get(
  "/routes/:routeId/students",
  withPermission(Permission.GET_ROUTES),
  async (req, res) => {
    try {
      const { routeId } = req.params;

      const students = await transportEnhancedService.getRouteStudents(routeId);

      return res.status(200).json({
        message: "Route students fetched successfully",
        data: students,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch route students",
      });
    }
  },
);

// Create maintenance record
router.post(
  "/:transportId/maintenance",
  withPermission(Permission.EDIT_TRANSPORT),
  async (req, res) => {
    try {
      const { transportId } = req.params;
      const {
        maintenanceType,
        description,
        cost,
        maintenanceDate,
        nextMaintenanceDate,
        serviceProvider,
        odometerReading,
      } = req.body.request || {};
      const currentUser = req.context.user;

      if (!maintenanceType || !maintenanceDate) {
        return res.status(400).json({
          message: "Maintenance type and date are required",
        });
      }

      const maintenance = await transportEnhancedService.createMaintenance({
        transportId,
        maintenanceType,
        description,
        cost,
        maintenanceDate,
        nextMaintenanceDate,
        serviceProvider,
        odometerReading,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Maintenance record created successfully",
        data: maintenance,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create maintenance record",
      });
    }
  },
);

// Get maintenance history
router.get(
  "/:transportId/maintenance",
  withPermission(Permission.GET_TRANSPORTS),
  async (req, res) => {
    try {
      const { transportId } = req.params;
      const query = req.query;

      const result = await transportEnhancedService.getMaintenanceHistory(transportId, {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 20,
      });

      return res.status(200).json({
        message: "Maintenance history fetched successfully",
        data: result.maintenance,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch maintenance history",
      });
    }
  },
);

export default router;
