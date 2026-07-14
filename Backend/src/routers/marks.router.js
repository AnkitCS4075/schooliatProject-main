import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import enterMarksSchema from "../schemas/marks/enter-marks.schema.js";
import enterBulkMarksSchema from "../schemas/marks/enter-bulk-marks.schema.js";
import calculateResultSchema from "../schemas/marks/calculate-result.schema.js";
import publishResultsSchema from "../schemas/marks/publish-results.schema.js";
import marksService from "../services/marks.service.js";
import logger from "../config/logger.js";

const router = Router();

// Enter marks
router.post(
  "/",
  withPermission([Permission.ENTER_MARKS]),
  validateRequest(enterMarksSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { examId, studentId, subjectId, classId, marksObtained, maxMarks } = req.body.request;

    // Verify exam exists and belongs to school
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "EXAM_NOT_FOUND",
        message: "Exam not found",
      });
    }

    // Verify student belongs to class and school
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: {
          select: {
            classId: true,
          },
        },
      },
    });

    if (!student || !student.studentProfile || student.studentProfile.classId !== classId) {
      return res.status(400).json({
        errorCode: "INVALID_STUDENT",
        message: "Student does not belong to the specified class",
      });
    }

    try {
      const marks = await marksService.enterMarks({
        examId,
        studentId,
        subjectId,
        classId,
        marksObtained,
        maxMarks,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      res.json({
        message: "Marks entered successfully",
        data: marks,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to enter marks");
      res.status(400).json({
        errorCode: "MARKS_ENTRY_FAILED",
        message: error.message || "Failed to enter marks",
      });
    }
  },
);

// Enter bulk marks
router.post(
  "/bulk",
  withPermission([Permission.ENTER_MARKS]),
  validateRequest(enterBulkMarksSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { marks: marksData } = req.body.request;

    // Add schoolId to each marks record
    const marksWithSchool = marksData.map((m) => ({
      ...m,
      schoolId: currentUser.schoolId,
    }));

    try {
      const result = await marksService.enterBulkMarks(marksWithSchool, currentUser.id);

      res.json({
        message: "Bulk marks entered successfully",
        data: {
          created: result.created,
          updated: result.updated,
          errors: result.errors,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to enter bulk marks");
      res.status(400).json({
        errorCode: "BULK_MARKS_ENTRY_FAILED",
        message: error.message || "Failed to enter bulk marks",
      });
    }
  },
);

// Calculate result
router.post(
  "/calculate-result",
  withPermission([Permission.ENTER_MARKS]),
  validateRequest(calculateResultSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { examId, studentId, classId, gradeConfig } = req.body.request;

    try {
      if (studentId) {
        const result = await marksService.calculateResult(
          examId,
          studentId,
          classId,
          gradeConfig || {},
          currentUser.id,
        );
        return res.json({
          message: "Result calculated successfully",
          data: result,
        });
      }

      // Bulk: calculate for all students in class
      const results = await marksService.calculateResultForClass(
        examId,
        classId,
        gradeConfig || {},
        currentUser.id,
      );
      return res.json({
        message: "Results calculated successfully",
        data: results,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to calculate result");
      res.status(400).json({
        errorCode: "RESULT_CALCULATION_FAILED",
        message: error.message || "Failed to calculate result",
      });
    }
  },
);

// Publish results (shared handler for /publish and /publish-results for mobile API)
const handlePublishResults = async (req, res) => {
  const currentUser = req.context.user;
  const { examId, classId } = req.body.request;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  if (!exam || exam.schoolId !== currentUser.schoolId) {
    return res.status(404).json({
      errorCode: "EXAM_NOT_FOUND",
      message: "Exam not found",
    });
  }

  try {
    const result = await marksService.publishResults(
      examId,
      classId || null,
      currentUser.id,
    );
    res.json({
      message: "Results published successfully",
      data: {
        published: result.published,
        studentsNotified: result.results.length,
      },
    });
  } catch (error) {
    logger.error({ error, examId, classId }, "Failed to publish results");
    res.status(400).json({
      errorCode: "PUBLISH_RESULTS_FAILED",
      message: error.message || "Failed to publish results",
    });
  }
};

router.post(
  "/publish",
  withPermission([Permission.PUBLISH_RESULTS]),
  validateRequest(publishResultsSchema),
  handlePublishResults,
);

router.post(
  "/publish-results",
  withPermission([Permission.PUBLISH_RESULTS]),
  validateRequest(publishResultsSchema),
  handlePublishResults,
);

// GET /marks/my-summary – current student's academic summary (authenticated)
router.get(
  "/my-summary",
  authorize,
  async (req, res) => {
    const currentUser = req.context.user;

    if (currentUser.role?.name !== RoleName.STUDENT) {
      return res.status(403).json({
        errorCode: "FORBIDDEN",
        message: "Only students can access their academic summary",
      });
    }

    try {
      const [marks, results] = await Promise.all([
        marksService.getStudentMarks(currentUser.id),
        marksService.getStudentResults(currentUser.id),
      ]);

      res.json({
        message: "Academic summary retrieved successfully",
        data: {
          marks,
          results,
        },
      });
    } catch (error) {
      logger.error({ error, userId: currentUser.id }, "Failed to get academic summary");
      res.status(500).json({
        errorCode: "ACADEMIC_SUMMARY_FETCH_FAILED",
        message: "Failed to retrieve academic summary",
      });
    }
  },
);

// Get marks
router.get(
  "/",
  withPermission([Permission.GET_MARKS]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { examId, studentId, classId } = req.query;

    try {
      // Role-based access
      if (currentUser.role.name === "STUDENT") {
        // Students can only see their own marks
        const marks = await marksService.getStudentMarks(
          currentUser.id,
          examId || null,
        );

        return res.json({
          message: "Marks retrieved successfully",
          data: marks,
        });
      }

      if (currentUser.role.name === "PARENT") {
        // Parents can see their children's marks
        if (!studentId) {
          return res.status(400).json({
            errorCode: "STUDENT_ID_REQUIRED",
            message: "Please specify studentId to view marks",
          });
        }

        // Verify parent-child relationship
        const link = await prisma.parentChildLink.findFirst({
          where: {
            parentId: currentUser.id,
            childId: studentId,
            deletedAt: null,
          },
        });

        if (!link) {
          return res.status(403).json({
            errorCode: "FORBIDDEN",
            message: "You can only view your children's marks",
          });
        }

        const marks = await marksService.getStudentMarks(studentId, examId || null);

        return res.json({
          message: "Marks retrieved successfully",
          data: marks,
        });
      }

      // Teachers and admins: examId required; classId optional (omit = all classes for this exam)
      if (examId) {
        const exam = await prisma.exam.findFirst({
          where: { id: examId, schoolId: currentUser.schoolId },
        });
        if (!exam) {
          return res.status(404).json({
            errorCode: "EXAM_NOT_FOUND",
            message: "Exam not found",
          });
        }
        const marks = await marksService.getExamMarks(examId, classId || null);

        return res.json({
          message: "Exam marks retrieved successfully",
          data: marks,
        });
      }

      if (studentId) {
        const marks = await marksService.getStudentMarks(studentId, examId || null);

        return res.json({
          message: "Student marks retrieved successfully",
          data: marks,
        });
      }

      // No filters: return empty list so the panel can show empty state
      return res.json({
        message: "Marks retrieved successfully",
        data: [],
      });
    } catch (error) {
      logger.error({ error, query: req.query }, "Failed to get marks");
      res.status(500).json({
        errorCode: "MARKS_FETCH_FAILED",
        message: "Failed to retrieve marks",
      });
    }
  },
);

// Get results
router.get(
  "/results",
  withPermission([Permission.GET_RESULTS]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { examId, studentId } = req.query;

    try {
      // Role-based access
      if (currentUser.role.name === "STUDENT") {
        const results = await marksService.getStudentResults(
          currentUser.id,
          examId || null,
        );

        return res.json({
          message: "Results retrieved successfully",
          data: results,
        });
      }

      if (currentUser.role.name === "PARENT") {
        if (!studentId) {
          return res.status(400).json({
            errorCode: "STUDENT_ID_REQUIRED",
            message: "Please specify studentId to view results",
          });
        }

        // Verify parent-child relationship
        const link = await prisma.parentChildLink.findFirst({
          where: {
            parentId: currentUser.id,
            childId: studentId,
            deletedAt: null,
          },
        });

        if (!link) {
          return res.status(403).json({
            errorCode: "FORBIDDEN",
            message: "You can only view your children's results",
          });
        }

        const results = await marksService.getStudentResults(studentId, examId || null);

        return res.json({
          message: "Results retrieved successfully",
          data: results,
        });
      }

      // Teachers and admins
      if (studentId) {
        const results = await marksService.getStudentResults(studentId, examId || null);

        return res.json({
          message: "Student results retrieved successfully",
          data: results,
        });
      }

      if (examId) {
        const results = await prisma.result.findMany({
          where: {
            examId,
            schoolId: currentUser.schoolId,
            deletedAt: null,
          },
          select: {
            id: true,
            examId: true,
            studentId: true,
            classId: true,
            totalMarks: true,
            maxTotalMarks: true,
            percentage: true,
            grade: true,
            rank: true,
            isPass: true,
            publishedAt: true,
            createdAt: true,
          },
          orderBy: { percentage: "desc" },
        });

        const mapped = results.map((r) => ({
          ...r,
          isPublished: !!r.publishedAt,
        }));

        return res.json({
          message: "Exam results retrieved successfully",
          data: mapped,
        });
      }

      res.status(400).json({
        errorCode: "INVALID_QUERY",
        message: "Please specify examId or studentId",
      });
    } catch (error) {
      logger.error({ error, query: req.query }, "Failed to get results");
      res.status(500).json({
        errorCode: "RESULTS_FETCH_FAILED",
        message: "Failed to retrieve results",
      });
    }
  },
);

// Export results as CSV
router.get(
  "/results/export",
  withPermission([Permission.GET_RESULTS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { examId, classId } = req.query;

      if (!examId) {
        return res.status(400).json({ message: "examId is required" });
      }

      const where = {
        examId,
        schoolId: currentUser.schoolId,
        deletedAt: null,
      };

      if (classId) {
        where.classId = classId;
      }

      const results = await prisma.result.findMany({
        where,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              publicUserId: true,
              studentProfile: {
                select: {
                  rollNumber: true,
                }
              }
            }
          },
          class: {
            select: { grade: true, division: true }
          },
          exam: {
            select: { name: true }
          }
        },
        orderBy: [
          { class: { grade: "asc" } },
          { student: { firstName: "asc" } }
        ]
      });

      const headers = [
        "Exam", "Class", "Student ID", "Roll No", "Name",
        "Total Marks", "Percentage", "Grade", "Status"
      ];

      const rows = results.map((r) => [
        r.exam?.name || "N/A",
        r.class ? `${r.class.grade}${r.class.division ? `-${r.class.division}` : ""}` : "N/A",
        r.student?.publicUserId || "N/A",
        r.student?.studentProfile?.rollNumber || "N/A",
        `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim(),
        r.totalMarks,
        r.percentage,
        r.grade || "N/A",
        r.isPass ? "Pass" : "Fail"
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=results_${examId}.csv`);
      return res.send(csvContent);
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to export results",
      });
    }
  }
);

export default router;

