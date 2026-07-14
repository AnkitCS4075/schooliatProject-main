import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import notesService from "../services/notes.service.js";
import createNoteSchema from "../schemas/notes/create-note.schema.js";
import updateNoteSchema from "../schemas/notes/update-note.schema.js";
import getNotesSchema from "../schemas/notes/get-notes.schema.js";
import createSyllabusSchema from "../schemas/syllabus/create-syllabus.schema.js";
import getSyllabusSchema from "../schemas/syllabus/get-syllabus.schema.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

// Create note
router.post(
  "/notes",
  withPermission(Permission.CREATE_NOTE),
  validateRequest(createNoteSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const note = await notesService.createNote({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Note created successfully",
        data: note,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create note",
      });
    }
  },
);

// Update note
router.put(
  "/notes/:id",
  withPermission(Permission.EDIT_NOTE),
  validateRequest(updateNoteSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const note = await notesService.updateNote(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Note updated successfully",
        data: note,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update note",
      });
    }
  },
);

// Get notes
router.get(
  "/notes",
  withPermission(Permission.GET_NOTES),
  validateRequest(getNotesSchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await notesService.getNotes(
        currentUser.schoolId,
        {
          subjectId: query.subjectId,
          classId: query.classId,
          chapter: query.chapter,
          topic: query.topic,
        },
        {
          page: query.page,
          limit: query.limit,
        },
      );

      return res.status(200).json({
        message: "Notes fetched successfully",
        data: result.notes,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch notes",
      });
    }
  },
);

// Get single note
router.get(
  "/notes/:id",
  withPermission(Permission.GET_NOTES),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;
      const note = await notesService.getNoteById(currentUser.schoolId, id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      return res.status(200).json({
        message: "Note fetched successfully",
        data: note,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch note",
      });
    }
  },
);

// Delete note
router.delete(
  "/notes/:id",
  withPermission(Permission.DELETE_NOTE),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Note" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.note.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "Note deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete note",
      });
    }
  },
);

// Create syllabus
router.post(
  "/syllabus",
  withPermission(Permission.CREATE_SYLLABUS),
  validateRequest(createSyllabusSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const syllabus = await notesService.createSyllabus({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Syllabus created successfully",
        data: syllabus,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create syllabus",
      });
    }
  },
);

// Update syllabus
router.put(
  "/syllabus/:id",
  withPermission(Permission.EDIT_SYLLABUS),
  validateRequest(createSyllabusSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const syllabus = await notesService.updateSyllabus(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Syllabus updated successfully",
        data: syllabus,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update syllabus",
      });
    }
  },
);

// Get syllabus
router.get(
  "/syllabus",
  withPermission(Permission.GET_SYLLABUS),
  validateRequest(getSyllabusSchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await notesService.getSyllabus(
        currentUser.schoolId,
        {
          subjectId: query.subjectId,
          classId: query.classId,
          academicYear: query.academicYear,
        },
        {
          page: query.page,
          limit: query.limit,
        },
      );

      return res.status(200).json({
        message: "Syllabus fetched successfully",
        data: result.syllabus,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch syllabus",
      });
    }
  },
);

// Get single syllabus
router.get(
  "/syllabus/:id",
  withPermission(Permission.GET_SYLLABUS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;
      const syllabus = await notesService.getSyllabusById(currentUser.schoolId, id);
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus not found" });
      }
      return res.status(200).json({
        message: "Syllabus fetched successfully",
        data: syllabus,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch syllabus",
      });
    }
  },
);

// Delete syllabus
router.delete(
  "/syllabus/:id",
  withPermission(Permission.DELETE_SYLLABUS),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Syllabus" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.syllabus.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "Syllabus deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete syllabus",
      });
    }
  },
);

// --- Mobile API: GET/POST /notes and PUT/DELETE /notes/:id (same as /notes/notes) ---
router.get(
  "/",
  withPermission(Permission.GET_NOTES),
  validateRequest(getNotesSchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;
      const result = await notesService.getNotes(
        currentUser.schoolId,
        { subjectId: query.subjectId, classId: query.classId, chapter: query.chapter, topic: query.topic },
        { page: query.page, limit: query.limit },
      );
      return res.status(200).json({
        message: "Notes fetched successfully",
        data: result.notes,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch notes" });
    }
  },
);

router.post(
  "/",
  withPermission(Permission.CREATE_NOTE),
  validateRequest(createNoteSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;
      const note = await notesService.createNote({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });
      return res.status(201).json({ message: "Note created successfully", data: note });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to create note" });
    }
  },
);

router.put(
  "/:id",
  withPermission(Permission.EDIT_NOTE),
  validateRequest(updateNoteSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;
      const note = await notesService.updateNote(id, { ...request, updatedBy: currentUser.id });
      return res.status(200).json({ message: "Note updated successfully", data: note });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update note" });
    }
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_NOTE),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;
      await prisma.note.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: currentUser.id },
      });
      return res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to delete note" });
    }
  },
);

export default router;

