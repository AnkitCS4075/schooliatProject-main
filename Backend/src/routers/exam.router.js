import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { parsePagination } from "../utils/pagination.util.js";
import createExamSchema from "../schemas/exam/create-exam.schema.js";
import getExamsSchema from "../schemas/exam/get-exams.schema.js";
import updateExamSchema from "../schemas/exam/update-exam.schema.js";
import deleteExamSchema from "../schemas/exam/delete-exam.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_EXAM),
  validateRequest(createExamSchema),
  async (req, res) => {
    const request = req.body.request;
    const currentUser = req.context.user;

    const newExam = await prisma.exam.create({
      data: {
        schoolId: currentUser.schoolId,
        year: request.year,
        name: request.name,
        type: request.type,
      },
    });

    return res.status(201).json({ message: "Exam created!", data: newExam });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_EXAMS),
  validateRequest(getExamsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;
    const q = req.query;
    const { page, limit, skip } = parsePagination({
      page: q.page ?? q.pageNumber,
      limit: q.limit ?? q.pageSize,
    });

    const where = { schoolId: schoolId || null };
    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { name: "asc" }],
      }),
      prisma.exam.count({ where }),
    ]);

    return res.json({
      message: "Exams fetched!",
      data: exams,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  },
);

router.patch(
  "/:id",
  withPermission(Permission.EDIT_EXAM),
  validateRequest(updateExamSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({ message: "Exam not found!" });
    }

    // Verify exam belongs to user's school
    if (existingExam.schoolId !== currentUser.schoolId) {
      return res.status(403).json({
        message: "You do not have permission to update this exam!",
      });
    }

    const examUpdateData = {};

    if (updateData.year !== undefined) examUpdateData.year = updateData.year;
    if (updateData.name !== undefined) examUpdateData.name = updateData.name;
    if (updateData.type !== undefined) examUpdateData.type = updateData.type;

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: examUpdateData,
    });

    return res.json({ message: "Exam updated!", data: updatedExam });
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_EXAM),
  validateRequest(deleteExamSchema),
  requireDeletionOTP({ entityType: "Exam" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return res.status(404).json({ message: "Exam not found!" });
    }

    // Verify exam belongs to user's school
    if (existingExam.schoolId !== currentUser.schoolId) {
      return res.status(403).json({
        message: "You do not have permission to delete this exam!",
      });
    }

    await prisma.exam.delete({
      where: { id },
    });

    return res.json({ message: "Exam deleted!" });
  },
);

export default router;
