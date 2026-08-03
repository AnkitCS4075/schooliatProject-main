import { Router } from "express";
import prisma from "../prisma/client.js";
import crypto from "crypto";
import { uploadFile } from "../config/storage/index.js";
import fileService from "../services/file.service.js";
import fileUpload from "../middlewares/file-upload.middleware.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, StudentDocumentCategory } from "../prisma/generated/index.js";
import logger from "../config/logger.js";

const router = Router();

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "pdf"]);

/**
 * Upload a document for a student (multipart):
 * fields: studentId, category (AADHAAR | PREVIOUS_SCHOOL | OTHERS), label
 */
router.post(
  "/",
  withPermission(Permission.EDIT_STUDENT),
  fileUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const currentUser = req.context.user;
      const studentId = req.body.studentId;
      const categoryRaw = String(req.body.category || "OTHERS").toUpperCase();
      const label = String(req.body.label || "").trim() || null;

      if (!studentId) {
        return res.status(400).json({ error: "studentId is required" });
      }
      if (!Object.values(StudentDocumentCategory).includes(categoryRaw)) {
        return res.status(400).json({ error: "Invalid category. Use AADHAAR, PREVIOUS_SCHOOL or OTHERS" });
      }

      const extension = (req.file.originalname.split(".").pop() || "").toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return res.status(400).json({ error: "Only JPG, PNG or PDF files are allowed (5 MB max)" });
      }

      const student = await prisma.user.findFirst({
        where: {
          id: studentId,
          schoolId: currentUser.schoolId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!student) {
        return res.status(404).json({ error: "Student not found in your school" });
      }

      const fileId = crypto.randomUUID();
      const key = `${fileId}.${extension}`;
      await uploadFile({
        buffer: req.file.buffer,
        key,
        contentType: req.file.mimetype,
      });

      const file = await prisma.file.create({
        data: {
          id: fileId,
          extension,
          name: req.file.originalname.replace(`.${extension}`, ""),
          contentType: req.file.mimetype,
          size: req.file.size,
          createdBy: currentUser.id,
        },
      });

      const doc = await prisma.studentDocument.create({
        data: {
          userId: studentId,
          category: categoryRaw,
          label,
          fileId: file.id,
          uploadedBy: currentUser.id,
        },
        include: { file: true },
      });

      return res.status(201).json({
        message: "Document uploaded successfully!",
        data: { ...doc, file: fileService.attachFileURL(doc.file) },
      });
    } catch (error) {
      logger.error({ error }, "Failed to upload student document");
      return res.status(400).json({ error: error.message || "Failed to upload document" });
    }
  },
);

// List documents for a student (Aadhaar, previous school, others)
router.get(
  "/student/:studentId",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const student = await prisma.user.findFirst({
        where: {
          id: req.params.studentId,
          schoolId: currentUser.schoolId,
          deletedAt: null,
        },
        select: { id: true },
      });
      if (!student) {
        return res.status(404).json({ error: "Student not found in your school" });
      }

      const docs = await prisma.studentDocument.findMany({
        where: { userId: req.params.studentId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { file: true },
      });

      const withUrls = docs.map((d) => ({
        ...d,
        file: d.file ? fileService.attachFileURL(d.file) : null,
      }));

      const summary = {
        total: withUrls.length,
        aadhaar: withUrls.filter((d) => d.category === "AADHAAR").length,
        previousSchool: withUrls.filter((d) => d.category === "PREVIOUS_SCHOOL").length,
        others: withUrls.filter((d) => d.category === "OTHERS").length,
      };

      return res.status(200).json({ message: "Documents fetched!", data: { items: withUrls, summary } });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Failed to fetch documents" });
    }
  },
);

// Get single document (for preview/download; file bytes served via /files/:id)
router.get(
  "/:id",
  withPermission(Permission.GET_STUDENTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const doc = await prisma.studentDocument.findFirst({
        where: { id: req.params.id, deletedAt: null },
        include: { file: true },
      });
      if (!doc) return res.status(404).json({ error: "Document not found" });

      const owner = await prisma.user.findFirst({
        where: { id: doc.userId, schoolId: currentUser.schoolId, deletedAt: null },
        select: { id: true },
      });
      if (!owner) return res.status(404).json({ error: "Document not found" });

      return res.status(200).json({
        message: "Document fetched!",
        data: { ...doc, file: doc.file ? fileService.attachFileURL(doc.file) : null },
      });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Failed to fetch document" });
    }
  },
);

// Soft-delete a document
router.delete(
  "/:id",
  withPermission(Permission.EDIT_STUDENT),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const doc = await prisma.studentDocument.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!doc) return res.status(404).json({ error: "Document not found" });

      const owner = await prisma.user.findFirst({
        where: { id: doc.userId, schoolId: currentUser.schoolId, deletedAt: null },
        select: { id: true },
      });
      if (!owner) return res.status(404).json({ error: "Document not found" });

      await prisma.studentDocument.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      return res.status(200).json({ message: "Document deleted!" });
    } catch (error) {
      return res.status(400).json({ error: error.message || "Failed to delete document" });
    }
  },
);

export default router;
