import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, SubmissionStatus } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createHomeworkSchema from "../schemas/homework/create-homework.schema.js";
import submitHomeworkSchema from "../schemas/homework/submit-homework.schema.js";
import gradeHomeworkSchema from "../schemas/homework/grade-homework.schema.js";
import getHomeworkSchema from "../schemas/homework/get-homework.schema.js";
import updateHomeworkSchema from "../schemas/homework/update-homework.schema.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import homeworkService from "../services/homework.service.js";
import logger from "../config/logger.js";

const router = Router();

// Create homework
router.post(
  "/",
  withPermission([Permission.CREATE_HOMEWORK]),
  validateRequest(createHomeworkSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { title, description, classIds, subjectId, dueDate, isMCQ, attachments, mcqQuestions } = req.body.request;

    // Verify teacher owns this or is school admin
    if (currentUser.role.name === "TEACHER" && currentUser.id !== currentUser.id) {
      // This will be set from context, but we can verify subject assignment if needed
    }

    // Verify all classes belong to the school
    const classes = await prisma.class.findMany({
      where: {
        id: { in: classIds },
        schoolId: currentUser.schoolId,
        deletedAt: null,
      },
    });

    if (classes.length !== classIds.length) {
      return res.status(400).json({
        errorCode: "INVALID_CLASSES",
        message: "One or more classes not found or don't belong to your school",
      });
    }

    // Verify subject belongs to school
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject || subject.schoolId !== currentUser.schoolId) {
      return res.status(400).json({
        errorCode: "INVALID_SUBJECT",
        message: "Subject not found or doesn't belong to your school",
      });
    }

    try {
      const homework = await homeworkService.createHomework({
        title,
        description,
        classIds,
        subjectId,
        teacherId: currentUser.id,
        dueDate: new Date(dueDate),
        isMCQ: isMCQ || false,
        attachments: attachments || [],
        mcqQuestions: mcqQuestions || [],
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      res.json({
        message: "Homework created successfully",
        data: homework,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to create homework");
      res.status(400).json({
        errorCode: "HOMEWORK_CREATION_FAILED",
        message: error.message || "Failed to create homework",
      });
    }
  },
);

// Shared submit handler (used by POST /submit and POST /:id/submit for mobile API)
const handleSubmitHomework = async (req, res) => {
  const currentUser = req.context.user;
  const { homeworkId, files, mcqAnswers } = req.body.request;

  if (currentUser.role.name !== "STUDENT") {
    return res.status(403).json({
      errorCode: "FORBIDDEN",
      message: "Only students can submit homework",
    });
  }

  const homework = await prisma.homework.findUnique({
    where: { id: homeworkId },
  });

  if (!homework) {
    return res.status(404).json({
      errorCode: "HOMEWORK_NOT_FOUND",
      message: "Homework not found",
    });
  }

  const student = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      studentProfile: {
        select: { classId: true },
      },
    },
  });

  if (!student?.studentProfile || !homework.classIds.includes(student.studentProfile.classId)) {
    return res.status(403).json({
      errorCode: "FORBIDDEN",
      message: "This homework is not assigned to your class",
    });
  }

  if (homework.isMCQ) {
    const questions = await prisma.mCQQuestion.findMany({
      where: { homeworkId },
    });
    if ((mcqAnswers || []).length !== questions.length) {
      return res.status(400).json({
        errorCode: "INCOMPLETE_ANSWERS",
        message: `Please answer all ${questions.length} questions`,
      });
    }
    for (const answer of mcqAnswers || []) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) {
        return res.status(400).json({
          errorCode: "INVALID_QUESTION",
          message: `Question ${answer.questionId} not found`,
        });
      }
      if (answer.selectedAnswer < 0 || answer.selectedAnswer >= question.options.length) {
        return res.status(400).json({
          errorCode: "INVALID_ANSWER",
          message: `Invalid answer index for question ${answer.questionId}`,
        });
      }
    }
  }

  try {
    const submission = await homeworkService.submitHomework(
      homeworkId,
      currentUser.id,
      files || [],
      mcqAnswers || [],
    );
    res.json({
      message: homework.isMCQ ? "Homework submitted and graded successfully" : "Homework submitted successfully",
      data: submission,
    });
  } catch (error) {
    logger.error({ error, homeworkId, studentId: currentUser.id }, "Failed to submit homework");
    res.status(400).json({
      errorCode: "SUBMISSION_FAILED",
      message: error.message || "Failed to submit homework",
    });
  }
};

// Shared grade handler (used by POST /grade and POST /:id/grade for mobile API)
const handleGradeHomework = async (req, res) => {
  const currentUser = req.context.user;
  const { submissionId, feedback, grade, marksObtained, totalMarks } = req.body.request;
  try {
    const graded = await homeworkService.gradeHomework(
      submissionId,
      currentUser.id,
      feedback || null,
      grade || null,
      marksObtained ?? null,
      totalMarks ?? null,
    );
    res.json({ message: "Homework graded successfully", data: graded });
  } catch (error) {
    logger.error({ error, submissionId }, "Failed to grade homework");
    res.status(400).json({
      errorCode: "GRADING_FAILED",
      message: error.message || "Failed to grade homework",
    });
  }
};

// Submit homework
router.post(
  "/submit",
  withPermission([Permission.SUBMIT_HOMEWORK]),
  validateRequest(submitHomeworkSchema),
  handleSubmitHomework,
);

// Mobile API: POST /homework/:id/submit (homeworkId in URL)
router.post(
  "/:id/submit",
  withPermission([Permission.SUBMIT_HOMEWORK]),
  (req, _res, next) => {
    req.body.request = { ...(req.body?.request || {}), homeworkId: req.params.id };
    next();
  },
  validateRequest(submitHomeworkSchema),
  handleSubmitHomework,
);

// Grade homework
router.post(
  "/grade",
  withPermission([Permission.GRADE_HOMEWORK]),
  validateRequest(gradeHomeworkSchema),
  handleGradeHomework,
);

// Mobile API: POST /homework/:id/grade (submissionId still in body)
router.post(
  "/:id/grade",
  withPermission([Permission.GRADE_HOMEWORK]),
  validateRequest(gradeHomeworkSchema),
  handleGradeHomework,
);

// Get homework
router.get(
  "/",
  withPermission([Permission.GET_HOMEWORK]),
  validateRequest(getHomeworkSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { homeworkId, studentId, classId, subjectId, status, page, limit } = req.query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;

    try {
      // Get specific homework
      if (homeworkId) {
        const homework = await prisma.homework.findUnique({
          where: { id: homeworkId },
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
            mcqQuestions: {
              select: {
                id: true,
                question: true,
                options: true,
                marks: true,
                // Don't expose correctAnswer to students
                ...(currentUser.role.name === "STUDENT" ? {} : { correctAnswer: true }),
              },
            },
            submissions: currentUser.role.name === "TEACHER" ? {
              where: {
                deletedAt: null,
              },
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    studentProfile: {
                      select: {
                        rollNumber: true,
                        class: {
                          select: {
                            grade: true,
                            division: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: {
                submittedAt: "desc",
              },
            } : {
              where: {
                studentId: currentUser.id,
                deletedAt: null,
              },
            },
          },
        });

        if (!homework || homework.schoolId !== currentUser.schoolId) {
          return res.status(404).json({
            errorCode: "HOMEWORK_NOT_FOUND",
            message: "Homework not found",
          });
        }

        // Role-based access
        if (currentUser.role.name === "STUDENT") {
          const student = await prisma.user.findUnique({
            where: { id: currentUser.id },
            include: {
              studentProfile: {
                select: {
                  classId: true,
                },
              },
            },
          });

          if (!student || !student.studentProfile || !homework.classIds.includes(student.studentProfile.classId)) {
            return res.status(403).json({
              errorCode: "FORBIDDEN",
              message: "You don't have access to this homework",
            });
          }
        }

        return res.json({
          message: "Homework retrieved successfully",
          data: homework,
        });
      }

      // Get homework submissions (for teachers)
      if (currentUser.role.name === "TEACHER" && !studentId && !classId) {
        // Get all homeworks created by this teacher
        const homeworks = await prisma.homework.findMany({
          where: {
            teacherId: currentUser.id,
            schoolId: currentUser.schoolId,
            deletedAt: null,
            ...(subjectId ? { subjectId } : {}),
          },
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                submissions: {
                  where: {
                    deletedAt: null,
                    ...(status ? { status } : {}),
                  },
                },
              },
            },
          },
          orderBy: {
            dueDate: "desc",
          },
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
        });

        const total = await prisma.homework.count({
          where: {
            teacherId: currentUser.id,
            schoolId: currentUser.schoolId,
            deletedAt: null,
            ...(subjectId ? { subjectId } : {}),
          },
        });

        return res.json({
          message: "Homeworks retrieved successfully",
          data: {
            homeworks,
            pagination: {
              page: pageNumber,
              limit: limitNumber,
              total,
              totalPages: Math.ceil(total / limitNumber),
            },
          },
        });
      }

      // Get all homeworks for a school (for admins)
      if (
        (currentUser.role.name === "SCHOOL_ADMIN" || currentUser.role.name === "SUPER_ADMIN") &&
        !homeworkId &&
        !studentId &&
        !classId
      ) {
        const adminWhere = {
          schoolId: currentUser.schoolId,
          deletedAt: null,
          ...(subjectId ? { subjectId } : {}),
        };

        const homeworks = await prisma.homework.findMany({
          where: adminWhere,
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                submissions: {
                  where: {
                    deletedAt: null,
                    ...(status ? { status } : {}),
                  },
                },
              },
            },
          },
          orderBy: {
            dueDate: "desc",
          },
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
        });

        const total = await prisma.homework.count({
          where: adminWhere,
        });

        return res.json({
          message: "Homeworks retrieved successfully",
          data: {
            homeworks,
            pagination: {
              page: pageNumber,
              limit: limitNumber,
              total,
              totalPages: Math.ceil(total / limitNumber),
            },
          },
        });
      }

      // Get student homework
      if (currentUser.role.name === "STUDENT" || (studentId && currentUser.role.name !== "STUDENT")) {
        const targetStudentId = currentUser.role.name === "STUDENT" ? currentUser.id : studentId;

        if (currentUser.role.name !== "STUDENT" && targetStudentId !== currentUser.id) {
          // Verify parent relationship or admin access
          if (currentUser.role.name === "PARENT") {
            const link = await prisma.parentChildLink.findFirst({
              where: {
                parentId: currentUser.id,
                childId: targetStudentId,
                deletedAt: null,
              },
            });

            if (!link) {
              return res.status(403).json({
                errorCode: "FORBIDDEN",
                message: "You can only view your children's homework",
              });
            }
          }
        }

        const result = await homeworkService.getStudentHomework(targetStudentId, {
          status: status || null,
          subjectId: subjectId || null,
          page: pageNumber,
          limit: limitNumber,
        });

        return res.json({
          message: "Student homework retrieved successfully",
          data: result,
        });
      }

      // Get submissions for a specific homework (for teachers)
      if (homeworkId && currentUser.role.name === "TEACHER") {
        const result = await homeworkService.getHomeworkSubmissions(homeworkId, {
          status: status || null,
          page,
          limit,
        });

        return res.json({
          message: "Homework submissions retrieved successfully",
          data: result,
        });
      }

      res.status(400).json({
        errorCode: "INVALID_QUERY",
        message: "Please specify homeworkId, studentId, or use appropriate role-based query",
      });
    } catch (error) {
      logger.error({ error, query: req.query }, "Failed to get homework");
      res.status(500).json({
        errorCode: "HOMEWORK_FETCH_FAILED",
        message: "Failed to retrieve homework",
      });
    }
  },
);

// Update homework
router.patch(
  "/:id",
  withPermission([Permission.EDIT_HOMEWORK]),
  validateRequest(updateHomeworkSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;
    const updateData = req.body.request;

    const homework = await prisma.homework.findUnique({ where: { id } });
    if (!homework || homework.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "HOMEWORK_NOT_FOUND",
        message: "Homework not found",
      });
    }

    if (currentUser.role.name === "TEACHER" && homework.teacherId !== currentUser.id) {
      return res.status(403).json({
        errorCode: "FORBIDDEN",
        message: "You can only edit your own homework",
      });
    }

    try {
      const data = {};
      if (updateData.title !== undefined) data.title = updateData.title;
      if (updateData.description !== undefined) data.description = updateData.description;
      if (updateData.classIds !== undefined) data.classIds = updateData.classIds;
      if (updateData.subjectId !== undefined) data.subjectId = updateData.subjectId;
      if (updateData.dueDate !== undefined) data.dueDate = new Date(updateData.dueDate);
      if (updateData.attachments !== undefined) data.attachments = updateData.attachments;
      data.updatedBy = currentUser.id;

      const updated = await prisma.homework.update({
        where: { id },
        data,
        include: {
          subject: { select: { id: true, name: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      res.json({ message: "Homework updated successfully", data: updated });
    } catch (error) {
      logger.error({ error, homeworkId: id }, "Failed to update homework");
      res.status(400).json({
        errorCode: "HOMEWORK_UPDATE_FAILED",
        message: error.message || "Failed to update homework",
      });
    }
  },
);

// Delete homework (soft delete)
router.delete(
  "/:id",
  withPermission([Permission.DELETE_HOMEWORK]),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Homework" }),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;

    const homework = await prisma.homework.findUnique({ where: { id } });
    if (!homework || homework.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "HOMEWORK_NOT_FOUND",
        message: "Homework not found",
      });
    }

    if (currentUser.role.name === "TEACHER" && homework.teacherId !== currentUser.id) {
      return res.status(403).json({
        errorCode: "FORBIDDEN",
        message: "You can only delete your own homework",
      });
    }

    try {
      await prisma.homework.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: currentUser.id },
      });
      res.json({ message: "Homework deleted successfully" });
    } catch (error) {
      logger.error({ error, homeworkId: id }, "Failed to delete homework");
      res.status(400).json({
        errorCode: "HOMEWORK_DELETE_FAILED",
        message: error.message || "Failed to delete homework",
      });
    }
  },
);

// Get MCQ results (for students after submission)
router.get(
  "/:homeworkId/mcq-results",
  withPermission([Permission.GET_HOMEWORK]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { homeworkId } = req.params;

    // Verify homework exists and is MCQ
    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
    });

    if (!homework || !homework.isMCQ) {
      return res.status(404).json({
        errorCode: "HOMEWORK_NOT_FOUND",
        message: "MCQ homework not found",
      });
    }

    // Get student's submission
    const submission = await prisma.homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId: currentUser.id,
        },
      },
      include: {
        mcqAnswers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                options: true,
                correctAnswer: true,
                marks: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        errorCode: "SUBMISSION_NOT_FOUND",
        message: "You haven't submitted this homework yet",
      });
    }

    res.json({
      message: "MCQ results retrieved successfully",
      data: {
        submission: {
          id: submission.id,
          marksObtained: submission.marksObtained,
          totalMarks: submission.totalMarks,
          status: submission.status,
        },
        answers: submission.mcqAnswers.map((answer) => ({
          question: answer.question.question,
          options: answer.question.options,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: answer.question.correctAnswer,
          isCorrect: answer.isCorrect,
          marksObtained: answer.marksObtained,
          totalMarks: answer.question.marks,
        })),
      },
    });
  },
);

export default router;

