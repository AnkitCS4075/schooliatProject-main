/**
 * Mobile API: GET /syllabus (same as GET /notes/syllabus).
 */
import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import notesService from "../services/notes.service.js";
import getSyllabusSchema from "../schemas/syllabus/get-syllabus.schema.js";

const router = Router();

router.get(
  "/",
  withPermission(Permission.GET_SYLLABUS),
  validateRequest(getSyllabusSchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;
      const result = await notesService.getSyllabus(
        currentUser.schoolId,
        { subjectId: query.subjectId, classId: query.classId, academicYear: query.academicYear },
        { page: query.page, limit: query.limit },
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

export default router;
