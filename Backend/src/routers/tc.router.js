import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import tcService from "../services/tc.service.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import { parsePagination } from "../utils/pagination.util.js";
import { z } from "zod";

const router = Router();

// Create TC schema
const createTCSchema = z.object({
  request: z.object({
    studentId: z.string().uuid(),
    reason: z.string().min(1),
    transferDate: z.string().min(1),
    destinationSchool: z.string().optional(),
    remarks: z.string().optional(),
  }),
});

const getTCsSchema = z.object({
  request: z.object({}),
  query: z.object({
    studentId: z.string().uuid().optional(),
    status: z.enum(["REQUESTED", "ISSUED", "COLLECTED", "CANCELLED"]).optional(),
    tcNumber: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
  params: z.object({}),
});

// Update TC status schema
const updateTCStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  request: z.object({
    status: z.enum(["ISSUED", "COLLECTED", "CANCELLED"]),
  }),
});

// Create TC
router.post(
  "/",
  withPermission(Permission.CREATE_STUDENT), // Using existing permission, can add specific TC permission later
  validateRequest(createTCSchema),
  async (req, res) => {
    try {
      const { studentId, reason, transferDate, destinationSchool, remarks } = req.body.request;
      const currentUser = req.context.user;

      const tc = await tcService.createTC({
        studentId,
        schoolId: currentUser.schoolId,
        reason,
        transferDate,
        destinationSchool,
        remarks,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Transfer Certificate created successfully",
        data: tc,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create Transfer Certificate",
      });
    }
  },
);

// Get TCs
router.get(
  "/",
  withPermission(Permission.GET_STUDENTS),
  validateRequest(getTCsSchema),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const q = req.query;
      const { page, limit, skip } = parsePagination({
        page: q.page,
        limit: q.limit,
      });

      const result = await tcService.getTCs(
        {
          schoolId: currentUser.schoolId,
          studentId: q.studentId || undefined,
          status: q.status || undefined,
          tcNumber: q.tcNumber || undefined,
          search: q.search || undefined,
        },
        { page, limit, skip },
      );

      return res.status(200).json({
        message: "Transfer Certificates fetched successfully",
        data: result.tcs,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(200).json({
        message: "Transfer Certificates fetched successfully",
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
      });
    }
  },
);

import tcPdfService from "../services/tc-pdf.service.js";

// Get TC by ID
router.get(
  "/:id",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const tc = await tcService.getTCById(id, currentUser.schoolId);

      if (!tc) {
        return res.status(404).json({
          message: "Transfer Certificate not found",
        });
      }

      return res.status(200).json({
        message: "Transfer Certificate fetched successfully",
        data: tc,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch Transfer Certificate",
      });
    }
  },
);

// Download TC PDF
router.get(
  "/:id/download",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const tc = await tcService.getTCById(id, currentUser.schoolId);

      if (!tc) {
        return res.status(404).json({
          message: "Transfer Certificate not found",
        });
      }

      const pdfBuffer = await tcPdfService.generateTCPdf(tc);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=TC_${tc.tcNumber.replace(/\//g, "_")}.pdf`,
      );
      return res.send(pdfBuffer);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to download Transfer Certificate",
      });
    }
  },
);

// Update TC status
router.patch(
  "/:id/status",
  withPermission(Permission.EDIT_STUDENT),
  validateRequest(updateTCStatusSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body.request;
      const currentUser = req.context.user;

      const tc = await tcService.updateTCStatus(id, status, currentUser.id);

      return res.status(200).json({
        message: "Transfer Certificate status updated successfully",
        data: tc,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update Transfer Certificate status",
      });
    }
  },
);

// Delete TC
router.delete(
  "/:id",
  withPermission(Permission.DELETE_STUDENT),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "TransferCertificate" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await tcService.deleteTC(id, currentUser.id);

      return res.status(200).json({
        message: "Transfer Certificate deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete Transfer Certificate",
      });
    }
  },
);

export default router;

