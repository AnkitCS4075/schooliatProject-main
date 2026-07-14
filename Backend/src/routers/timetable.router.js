import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import createTimetableSchema from "../schemas/timetable/create-timetable.schema.js";
import updateTimetableSchema from "../schemas/timetable/update-timetable.schema.js";
import getTimetableSchema from "../schemas/timetable/get-timetable.schema.js";
import checkConflictsSchema from "../schemas/timetable/check-conflicts.schema.js";
import { deleteTimetableSchema } from "../schemas/timetable/delete-timetable.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import timetableService from "../services/timetable.service.js";
import logger from "../config/logger.js";

const router = Router();

// Create timetable
router.post(
  "/",
  withPermission([Permission.CREATE_TIMETABLE]),
  validateRequest(createTimetableSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { name, classId, effectiveFrom, effectiveTill, slots } = req.body.request;

    // Validate time ranges in slots
    for (const slot of slots) {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          errorCode: "INVALID_TIME_RANGE",
          message: `Invalid time range for period ${slot.periodNumber}: end time must be after start time`,
        });
      }
    }

    try {
      const timetable = await timetableService.createTimetable({
        name,
        classId: classId || null,
        schoolId: currentUser.schoolId,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTill: effectiveTill ? new Date(effectiveTill) : null,
        slots,
        createdBy: currentUser.id,
      });

      res.json({
        message: "Timetable created successfully",
        data: timetable,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to create timetable");
      res.status(400).json({
        errorCode: "TIMETABLE_CREATION_FAILED",
        message: error.message || "Failed to create timetable",
      });
    }
  },
);

// Update timetable
router.put(
  "/:timetableId",
  withPermission([Permission.EDIT_TIMETABLE]),
  validateRequest(updateTimetableSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { timetableId } = req.params;
    const updateData = req.body.request;

    // Verify timetable belongs to user's school
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable || timetable.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "TIMETABLE_NOT_FOUND",
        message: "Timetable not found",
      });
    }

    // Validate time ranges if slots are being updated
    if (updateData.slots) {
      for (const slot of updateData.slots) {
        const [startHour, startMin] = slot.startTime.split(":").map(Number);
        const [endHour, endMin] = slot.endTime.split(":").map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        if (endMinutes <= startMinutes) {
          return res.status(400).json({
            errorCode: "INVALID_TIME_RANGE",
            message: `Invalid time range for period ${slot.periodNumber}: end time must be after start time`,
          });
        }
      }
    }

    try {
      const updated = await timetableService.updateTimetable(timetableId, {
        ...updateData,
        updatedBy: currentUser.id,
      });

      res.json({
        message: "Timetable updated successfully",
        data: updated,
      });
    } catch (error) {
      logger.error({ error, timetableId }, "Failed to update timetable");
      res.status(400).json({
        errorCode: "TIMETABLE_UPDATE_FAILED",
        message: error.message || "Failed to update timetable",
      });
    }
  },
);

// GET /timetable/my-classes – current teacher's assigned classes (authenticated)
router.get(
  "/my-classes",
  authorize,
  async (req, res) => {
    const currentUser = req.context.user;

    if (currentUser.role?.name !== RoleName.TEACHER) {
      return res.status(403).json({
        errorCode: "FORBIDDEN",
        message: "Only teachers can access their assigned classes",
      });
    }

    try {
      const timetable = await timetableService.getTeacherTimetable(currentUser.id);
      res.json({
        message: "Teacher timetable retrieved successfully",
        data: timetable,
      });
    } catch (error) {
      logger.error({ error, userId: currentUser.id }, "Failed to get teacher timetable");
      res.status(500).json({
        errorCode: "TIMETABLE_FETCH_FAILED",
        message: "Failed to retrieve teacher timetable",
      });
    }
  },
);

// Mobile API: GET /timetables/:id – get timetable by ID
router.get(
  "/:id",
  withPermission([Permission.GET_TIMETABLE]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id: timetableId } = req.params;
    try {
      const timetable = await prisma.timetable.findUnique({
        where: { id: timetableId },
        include: {
          slots: {
            include: {
              subject: { select: { id: true, name: true } },
              teacher: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: [
              { dayOfWeek: "asc" },
              { periodNumber: "asc" },
            ],
          },
          class: { select: { id: true, grade: true, division: true } },
        },
      });
      if (!timetable || timetable.schoolId !== currentUser.schoolId) {
        return res.status(404).json({
          errorCode: "TIMETABLE_NOT_FOUND",
          message: "Timetable not found",
        });
      }
      return res.json({
        message: "Timetable retrieved successfully",
        data: timetable,
      });
    } catch (error) {
      logger.error({ error, timetableId }, "Failed to get timetable by ID");
      res.status(500).json({
        errorCode: "TIMETABLE_FETCH_FAILED",
        message: "Failed to retrieve timetable",
      });
    }
  },
);

// Get timetable
router.get(
  "/",
  withPermission([Permission.GET_TIMETABLE]),
  validateRequest(getTimetableSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { classId, teacherId, subjectId, date, timetableId } = req.query;

    try {
      // Get by timetable ID
      if (timetableId) {
        const timetable = await prisma.timetable.findUnique({
          where: { id: timetableId },
          include: {
            slots: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                teacher: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy: [
                { dayOfWeek: "asc" },
                { periodNumber: "asc" },
              ],
            },
            class: {
              select: {
                id: true,
                grade: true,
                division: true,
              },
            },
          },
        });

        if (!timetable || timetable.schoolId !== currentUser.schoolId) {
          return res.status(404).json({
            errorCode: "TIMETABLE_NOT_FOUND",
            message: "Timetable not found",
          });
        }

        return res.json({
          message: "Timetable retrieved successfully",
          data: timetable,
        });
      }

      // Get by class
      if (classId) {
        const timetable = await timetableService.getClassTimetable(
          classId,
          date ? new Date(date) : new Date(),
        );

        if (!timetable) {
          return res.json({
            message: "No active timetable found for this class",
            data: null,
          });
        }

        return res.json({
          message: "Class timetable retrieved successfully",
          data: timetable,
        });
      }

      // Get by teacher
      if (teacherId) {
        // Verify access: teachers can only see their own timetable
        if (currentUser.role.name === "TEACHER" && teacherId !== currentUser.id) {
          return res.status(403).json({
            errorCode: "FORBIDDEN",
            message: "You can only view your own timetable",
          });
        }

        const timetable = await timetableService.getTeacherTimetable(
          teacherId,
          date ? new Date(date) : new Date(),
        );

        return res.json({
          message: "Teacher timetable retrieved successfully",
          data: timetable,
        });
      }

      // Get by subject
      if (subjectId) {
        const timetable = await timetableService.getSubjectTimetable(
          subjectId,
          currentUser.schoolId,
          date ? new Date(date) : new Date(),
        );

        return res.json({
          message: "Subject timetable retrieved successfully",
          data: timetable,
        });
      }

      // Get all timetables for school (admin only)
      if (currentUser.role.name === "SCHOOL_ADMIN" || currentUser.role.name === "SUPER_ADMIN") {
        const timetables = await prisma.timetable.findMany({
          where: {
            schoolId: currentUser.schoolId,
            deletedAt: null,
          },
          include: {
            class: {
              select: {
                id: true,
                grade: true,
                division: true,
              },
            },
            slots: {
              include: {
                subject: {
                  select: { id: true, name: true },
                },
                teacher: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
              orderBy: [
                { dayOfWeek: "asc" },
                { periodNumber: "asc" },
              ],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return res.json({
          message: "Timetables retrieved successfully",
          data: timetables,
        });
      }

      res.status(400).json({
        errorCode: "INVALID_QUERY",
        message: "Please specify classId, teacherId, subjectId, or timetableId",
      });
    } catch (error) {
      logger.error({ error, query: req.query }, "Failed to get timetable");
      res.status(500).json({
        errorCode: "TIMETABLE_FETCH_FAILED",
        message: "Failed to retrieve timetable",
      });
    }
  },
);

// Check conflicts
router.post(
  "/check-conflicts",
  withPermission([Permission.CREATE_TIMETABLE, Permission.EDIT_TIMETABLE]),
  validateRequest(checkConflictsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { slots, classId, excludeTimetableId } = req.body.request;

    // Validate time ranges
    for (const slot of slots) {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          errorCode: "INVALID_TIME_RANGE",
          message: `Invalid time range for period ${slot.periodNumber}: end time must be after start time`,
        });
      }
    }

    try {
      const conflicts = await timetableService.detectConflicts(
        slots,
        currentUser.schoolId,
        classId || null,
        excludeTimetableId || null,
      );

      res.json({
        message: conflicts.length === 0 ? "No conflicts detected" : "Conflicts detected",
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to check conflicts");
      res.status(500).json({
        errorCode: "CONFLICT_CHECK_FAILED",
        message: "Failed to check conflicts",
      });
    }
  },
);

// Get print-friendly timetable
router.get(
  "/:timetableId/print",
  withPermission([Permission.GET_TIMETABLE]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { timetableId } = req.params;

    // Verify timetable belongs to user's school
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable || timetable.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "TIMETABLE_NOT_FOUND",
        message: "Timetable not found",
      });
    }

    try {
      const printData = await timetableService.getPrintFriendlyTimetable(timetableId);

      if (!printData) {
        return res.status(404).json({
          errorCode: "TIMETABLE_NOT_FOUND",
          message: "Timetable not found",
        });
      }

      res.json({
        message: "Print-friendly timetable retrieved successfully",
        data: printData,
      });
    } catch (error) {
      logger.error({ error, timetableId }, "Failed to get print-friendly timetable");
      res.status(500).json({
        errorCode: "PRINT_TIMETABLE_FAILED",
        message: "Failed to generate print-friendly timetable",
      });
    }
  },
);

// Delete timetable (soft delete)
router.delete(
  "/:timetableId",
  withPermission([Permission.DELETE_TIMETABLE]),
  validateRequest(deleteTimetableSchema),
  requireDeletionOTP({ entityType: "Timetable" }),
  async (req, res) => {
    const currentUser = req.context.user;
    const { timetableId } = req.params;

    // Verify timetable belongs to user's school
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable || timetable.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "TIMETABLE_NOT_FOUND",
        message: "Timetable not found",
      });
    }

    await prisma.timetable.update({
      where: { id: timetableId },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
        isActive: false,
      },
    });

    res.json({
      message: "Timetable deleted successfully",
    });
  },
);

export default router;

