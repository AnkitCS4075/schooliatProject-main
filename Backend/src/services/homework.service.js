import prisma from "../prisma/client.js";
import { SubmissionStatus } from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";
import emailService from "./email.service.js";

/**
 * Create homework assignment
 * @param {Object} data - Homework data
 * @param {string} data.title - Homework title
 * @param {string} data.description - Homework description (rich text)
 * @param {Array<string>} data.classIds - Array of class IDs
 * @param {string} data.subjectId - Subject ID
 * @param {string} data.teacherId - Teacher user ID
 * @param {Date} data.dueDate - Due date
 * @param {boolean} data.isMCQ - Whether it's an MCQ assignment
 * @param {Array<string>} data.attachments - Array of file IDs
 * @param {Array} data.mcqQuestions - Array of MCQ questions (if isMCQ)
 * @param {string} data.schoolId - School ID
 * @param {string} data.createdBy - User ID creating the homework
 * @returns {Promise<Object>} - Created homework
 */
const createHomework = async (data) => {
  const {
    title,
    description,
    classIds,
    subjectId,
    teacherId,
    dueDate,
    isMCQ = false,
    attachments = [],
    mcqQuestions = [],
    schoolId,
    createdBy,
  } = data;

  // Validate MCQ questions if it's an MCQ assignment
  if (isMCQ && (!mcqQuestions || mcqQuestions.length === 0)) {
    throw new Error("MCQ homework must have at least one question");
  }

  // Create homework with submissions and MCQ questions in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create homework
    const homework = await tx.homework.create({
      data: {
        title,
        description,
        classIds,
        subjectId,
        teacherId,
        dueDate: new Date(dueDate),
        isMCQ,
        attachments,
        schoolId,
        createdBy,
      },
    });

    // Create MCQ questions if applicable
    if (isMCQ && mcqQuestions.length > 0) {
      const questionData = mcqQuestions.map((q) => ({
        homeworkId: homework.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
        createdBy,
      }));

      await tx.mCQQuestion.createMany({
        data: questionData,
      });
    }

    // Get all students in the assigned classes
    const students = await tx.user.findMany({
      where: {
        studentProfile: {
          classId: {
            in: classIds,
          },
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    // Create initial submission records for all students
    const submissionData = students.map((student) => ({
      homeworkId: homework.id,
      studentId: student.id,
      status: SubmissionStatus.PENDING,
      createdBy,
    }));

    if (submissionData.length > 0) {
      await tx.homeworkSubmission.createMany({
        data: submissionData,
      });
    }

    // Fetch created homework with relations
    const createdHomework = await tx.homework.findUnique({
      where: { id: homework.id },
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
        mcqQuestions: true,
      },
    });

    return createdHomework;
  });

  // Send notifications to students
  await notifyHomeworkCreated(result, createdBy);

  return result;
};

/**
 * Submit homework
 * @param {string} homeworkId - Homework ID
 * @param {string} studentId - Student user ID
 * @param {Array<string>} files - Array of file IDs
 * @param {Array} mcqAnswers - Array of MCQ answers (if MCQ homework)
 * @returns {Promise<Object>} - Updated submission
 */
const submitHomework = async (homeworkId, studentId, files = [], mcqAnswers = []) => {
  // Get homework
  const homework = await prisma.homework.findUnique({
    where: { id: homeworkId },
    include: {
      mcqQuestions: true,
    },
  });

  if (!homework) {
    throw new Error("Homework not found");
  }

  // Check if due date has passed
  if (new Date() > new Date(homework.dueDate)) {
    // Still allow submission but mark as overdue
    logger.warn({ homeworkId, studentId }, "Homework submitted after due date");
  }

  // Get or create submission
  let submission = await prisma.homeworkSubmission.findUnique({
    where: {
      homeworkId_studentId: {
        homeworkId,
        studentId,
      },
    },
  });

  if (!submission) {
    submission = await prisma.homeworkSubmission.create({
      data: {
        homeworkId,
        studentId,
        status: SubmissionStatus.PENDING,
      },
    });
  }

  // Update submission
  const updateData = {
    files,
    submittedAt: new Date(),
    status: SubmissionStatus.SUBMITTED,
  };

  // If MCQ homework, evaluate answers
  if (homework.isMCQ && mcqAnswers.length > 0) {
    const evaluation = await evaluateMCQAnswers(homeworkId, mcqAnswers, homework.mcqQuestions);
    updateData.marksObtained = evaluation.totalMarks;
    updateData.totalMarks = evaluation.maxMarks;
    updateData.status = SubmissionStatus.GRADED;

    // Create MCQ answer records
    await prisma.$transaction(async (tx) => {
      // Delete existing answers
      await tx.mCQAnswer.deleteMany({
        where: { submissionId: submission.id },
      });

      // Create new answers
      const answerData = evaluation.answers.map((answer) => ({
        submissionId: submission.id,
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
        marksObtained: answer.marksObtained,
        createdBy: studentId,
      }));

      await tx.mCQAnswer.createMany({
        data: answerData,
      });
    });
  }

  const updated = await prisma.homeworkSubmission.update({
    where: { id: submission.id },
    data: updateData,
    include: {
      homework: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      mcqAnswers: {
        include: {
          question: {
            select: {
              id: true,
              question: true,
              correctAnswer: true,
              marks: true,
            },
          },
        },
      },
    },
  });

  return updated;
};

/**
 * Evaluate MCQ answers
 * @param {string} homeworkId - Homework ID
 * @param {Array} answers - Array of student answers
 * @param {Array} questions - Array of MCQ questions
 * @returns {Promise<Object>} - Evaluation result
 */
const evaluateMCQAnswers = async (homeworkId, answers, questions) => {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedAnswer]));
  const evaluation = {
    totalMarks: 0,
    maxMarks: 0,
    answers: [],
  };

  questions.forEach((question) => {
    const selectedAnswer = answerMap.get(question.id);
    const isCorrect = selectedAnswer === question.correctAnswer;
    const marksObtained = isCorrect ? question.marks : 0;

    evaluation.maxMarks += question.marks;
    evaluation.totalMarks += marksObtained;
    evaluation.answers.push({
      questionId: question.id,
      selectedAnswer: selectedAnswer || -1,
      isCorrect,
      marksObtained,
    });
  });

  return evaluation;
};

/**
 * Grade homework submission
 * @param {string} submissionId - Submission ID
 * @param {string} teacherId - Teacher user ID
 * @param {string} feedback - Teacher feedback
 * @param {string} grade - Grade (optional)
 * @param {number} marksObtained - Marks obtained (optional)
 * @param {number} totalMarks - Total marks (optional)
 * @returns {Promise<Object>} - Updated submission
 */
const gradeHomework = async (submissionId, teacherId, feedback, grade = null, marksObtained = null, totalMarks = null) => {
  const submission = await prisma.homeworkSubmission.findUnique({
    where: { id: submissionId },
    include: {
      homework: true,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Verify teacher owns this homework
  if (submission.homework.teacherId !== teacherId) {
    throw new Error("You are not authorized to grade this homework");
  }

  const updateData = {
    feedback,
    status: SubmissionStatus.GRADED,
  };

  if (grade) updateData.grade = grade;
  if (marksObtained !== null) updateData.marksObtained = marksObtained;
  if (totalMarks !== null) updateData.totalMarks = totalMarks;

  const updated = await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: updateData,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      homework: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Send notification to student
  await notificationService.createNotification({
    userId: submission.studentId,
    title: "Homework Graded",
    content: `Your homework "${submission.homework.title}" has been graded. ${feedback ? `Feedback: ${feedback}` : ""}`,
    type: "HOMEWORK",
    actionUrl: `/homework/${submission.homeworkId}`,
    schoolId: submission.homework.schoolId,
    createdBy: teacherId,
  });

  return updated;
};

/**
 * Get homework submissions
 * @param {string} homeworkId - Homework ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Submissions with pagination
 */
const getHomeworkSubmissions = async (homeworkId, filters = {}) => {
  const {
    status = null,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  const where = {
    homeworkId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const [submissions, total] = await Promise.all([
    prisma.homeworkSubmission.findMany({
      where,
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
        mcqAnswers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                correctAnswer: true,
                marks: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.homeworkSubmission.count({ where }),
  ]);

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get student homework
 * @param {string} studentId - Student user ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Homework list with pagination
 */
const getStudentHomework = async (studentId, filters = {}) => {
  const {
    status = null,
    subjectId = null,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // Get student's class
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

  if (!student || !student.studentProfile || !student.studentProfile.classId) {
    return {
      homeworks: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const classId = student.studentProfile.classId;
  const where = {
    deletedAt: null,
  };
  // Support both String[] (array_contains) and Json (path) depending on DB column type
  try {
    where.classIds = { has: classId };
  } catch (_) {
    return {
      homeworks: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  if (subjectId) {
    where.subjectId = subjectId;
  }

  let homeworks = [];
  let total = 0;
  try {
    [homeworks, total] = await Promise.all([
      prisma.homework.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true } },
          teacher: { select: { id: true, firstName: true, lastName: true } },
          submissions: {
            where: { studentId, deletedAt: null },
            select: { id: true, status: true, submittedAt: true, marksObtained: true, totalMarks: true, grade: true },
          },
          mcqQuestions: { select: { id: true, question: true, options: true, marks: true } },
        },
        orderBy: { dueDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.homework.count({ where }),
    ]);
  } catch (err) {
    logger.warn({ err: err.message, studentId }, "getStudentHomework fetch failed, returning empty");
    return {
      homeworks: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  return {
    homeworks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Notify students about new homework
 * @param {Object} homework - Homework object
 * @param {string} createdBy - User ID who created
 */
const notifyHomeworkCreated = async (homework, createdBy) => {
  try {
    // Get all students in assigned classes
    const students = await prisma.user.findMany({
      where: {
        studentProfile: {
          classId: {
            in: homework.classIds,
          },
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    // Get parents of students
    const parentLinks = await prisma.parentChildLink.findMany({
      where: {
        childId: {
          in: students.map((s) => s.id),
        },
        deletedAt: null,
      },
      select: {
        parentId: true,
      },
    });

    const parentIds = [...new Set(parentLinks.map((link) => link.parentId))];
    const allUserIds = [...students.map((s) => s.id), ...parentIds];

    if (allUserIds.length > 0) {
      await notificationService.createBulkNotifications(allUserIds, {
        title: "New Homework Assignment",
        content: `New homework "${homework.title}" has been assigned. Due date: ${new Date(homework.dueDate).toLocaleDateString()}`,
        type: "HOMEWORK",
        actionUrl: `/homework/${homework.id}`,
        schoolId: homework.schoolId,
        createdBy,
      });
    }
  } catch (error) {
    logger.error({ error, homeworkId: homework.id }, "Failed to send homework notifications");
  }
};

const homeworkService = {
  createHomework,
  submitHomework,
  gradeHomework,
  getHomeworkSubmissions,
  getStudentHomework,
  evaluateMCQAnswers,
};

export default homeworkService;

