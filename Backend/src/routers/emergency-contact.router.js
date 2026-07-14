import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import emergencyContactService from "../services/emergency-contact.service.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import { z } from "zod";

const router = Router();

// Must match validate-request.middleware shape: { request, query, params } (not nested under `body`).
const createEmergencyContactSchema = z.object({
  request: z.object({
    studentId: z.string().uuid(),
    name: z.string().min(1),
    relationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE", "OTHER"]),
    contact: z.string().min(1),
    alternateContact: z.string().optional(),
    address: z.string().optional(),
    isPrimary: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({}),
});

const updateEmergencyContactSchema = z.object({
  request: z.object({
    name: z.string().min(1).optional(),
    relationship: z.enum(["FATHER", "MOTHER", "GUARDIAN", "RELATIVE", "OTHER"]).optional(),
    contact: z.string().min(1).optional(),
    alternateContact: z.string().optional(),
    address: z.string().optional(),
    isPrimary: z.boolean().optional(),
  }),
  query: z.object({}),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// Create emergency contact
router.post(
  "/",
  withPermission(Permission.CREATE_STUDENT),
  validateRequest(createEmergencyContactSchema),
  async (req, res) => {
    try {
      const { studentId, name, relationship, contact, alternateContact, address, isPrimary } = req.body.request;
      const currentUser = req.context.user;

      const emergencyContact = await emergencyContactService.createEmergencyContact({
        studentId,
        schoolId: currentUser.schoolId,
        name,
        relationship,
        contact,
        alternateContact,
        address,
        isPrimary,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Emergency contact created successfully",
        data: emergencyContact,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create emergency contact",
      });
    }
  },
);

// Get emergency contacts for a student
router.get(
  "/student/:studentId",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const { studentId } = req.params;
      const currentUser = req.context.user;

      const contacts = await emergencyContactService.getEmergencyContacts(
        studentId,
        currentUser.schoolId,
      );

      return res.status(200).json({
        message: "Emergency contacts fetched successfully",
        data: contacts,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch emergency contacts",
      });
    }
  },
);

// Get emergency contact by ID
router.get(
  "/:id",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const contact = await emergencyContactService.getEmergencyContactById(
        id,
        currentUser.schoolId,
      );

      if (!contact) {
        return res.status(404).json({
          message: "Emergency contact not found",
        });
      }

      return res.status(200).json({
        message: "Emergency contact fetched successfully",
        data: contact,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch emergency contact",
      });
    }
  },
);

// Update emergency contact
router.patch(
  "/:id",
  withPermission(Permission.EDIT_STUDENT),
  validateRequest(updateEmergencyContactSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body.request;
      const currentUser = req.context.user;

      const contact = await emergencyContactService.updateEmergencyContact(
        id,
        updateData,
        currentUser.id,
      );

      return res.status(200).json({
        message: "Emergency contact updated successfully",
        data: contact,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update emergency contact",
      });
    }
  },
);

// Delete emergency contact
router.delete(
  "/:id",
  withPermission(Permission.DELETE_STUDENT),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "EmergencyContact" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await emergencyContactService.deleteEmergencyContact(id, currentUser.id);

      return res.status(200).json({
        message: "Emergency contact deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete emergency contact",
      });
    }
  },
);

export default router;

