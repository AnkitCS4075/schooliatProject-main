import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";

/**
 * Enter marks for a student
 * @param {Object} data - Marks data
 * @param {string} data.examId - Exam ID
 * @param {string} data.studentId - Student user ID
 * @param {string} data.subjectId - Subject ID
 * @param {string} data.classId - Class ID
 * @param {number} data.marksObtained - Marks obtained
 * @param {number} data.maxMarks - Maximum marks
 * @param {string} data.schoolId - School ID
 * @param {string} data.createdBy - User ID entering marks
 * @returns {Promise<Object>} - Created marks record
 */
const enterMarks = async (data) => {
  const {
    examId,
    studentId,
    subjectId,
    classId,
    marksObtained,
    maxMarks,
    schoolId,
    createdBy,
  } = data;

  // Calculate percentage
  const percentage = (marksObtained / maxMarks) * 100;

  // Check if marks already exist
  const existing = await prisma.marks.findUnique({
    where: {
      examId_studentId_subjectId: {
        examId,
        studentId,
        subjectId,
      },
    },
  });

  let marks;
  if (existing) {
    // Update existing marks
    marks = await prisma.marks.update({
      where: { id: existing.id },
      data: {
        marksObtained,
        maxMarks,
        percentage,
        updatedBy: createdBy,
      },
    });
  } else {
    // Create new marks
    marks = await prisma.marks.create({
      data: {
        examId,
        studentId,
        subjectId,
        classId,
        marksObtained,
        maxMarks,
        percentage,
        schoolId,
        createdBy,
      },
    });
  }

  return marks;
};

/**
 * Enter bulk marks
 * @param {Array} marksData - Array of marks records
 * @param {string} createdBy - User ID entering marks
 * @returns {Promise<Object>} - Result with counts
 */
const enterBulkMarks = async (marksData, createdBy) => {
  const results = {
    created: 0,
    updated: 0,
    errors: [],
  };

  // Process in batches
  const batchSize = 50;
  for (let i = 0; i < marksData.length; i += batchSize) {
    const batch = marksData.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (data) => {
        try {
          const percentage = (data.marksObtained / data.maxMarks) * 100;

          const existing = await prisma.marks.findUnique({
            where: {
              examId_studentId_subjectId: {
                examId: data.examId,
                studentId: data.studentId,
                subjectId: data.subjectId,
              },
            },
          });

          if (existing) {
            await prisma.marks.update({
              where: { id: existing.id },
              data: {
                marksObtained: data.marksObtained,
                maxMarks: data.maxMarks,
                percentage,
                updatedBy: createdBy,
              },
            });
            results.updated++;
          } else {
            await prisma.marks.create({
              data: {
                ...data,
                percentage,
                createdBy,
              },
            });
            results.created++;
          }
        } catch (error) {
          results.errors.push({
            studentId: data.studentId,
            subjectId: data.subjectId,
            error: error.message,
          });
        }
      }),
    );
  }

  return results;
};

/**
 * Calculate and create result for a student
 * @param {string} examId - Exam ID
 * @param {string} studentId - Student user ID
 * @param {string} classId - Class ID
 * @param {Object} gradeConfig - Grade configuration
 * @param {string} createdBy - User ID creating result
 * @returns {Promise<Object>} - Created result
 */
const calculateResult = async (examId, studentId, classId, gradeConfig, createdBy) => {
  // Get all marks for this exam and student
  const marks = await prisma.marks.findMany({
    where: {
      examId,
      studentId,
      deletedAt: null,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (marks.length === 0) {
    throw new Error("No marks found for this exam");
  }

  // Calculate totals
  const totalMarks = marks.reduce((sum, m) => sum + Number(m.marksObtained), 0);
  const maxTotalMarks = marks.reduce((sum, m) => sum + Number(m.maxMarks), 0);
  const percentage = (totalMarks / maxTotalMarks) * 100;

  // Calculate CGPA if configured
  let cgpa = null;
  if (gradeConfig.cgpaScale) {
    const averagePercentage = marks.reduce((sum, m) => sum + Number(m.percentage), 0) / marks.length;
    cgpa = (averagePercentage / 100) * gradeConfig.cgpaScale;
  }

  // Determine grade
  const grade = calculateGrade(percentage, gradeConfig.gradeRanges || []);

  // Determine pass/fail
  const isPass = percentage >= (gradeConfig.passingPercentage || 33);

  // Get school ID from exam
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
  });

  // Calculate rank (if all students have results)
  let rank = null;
  if (gradeConfig.calculateRank) {
    const allResults = await prisma.result.findMany({
      where: {
        examId,
        classId,
        deletedAt: null,
      },
      orderBy: {
        percentage: "desc",
      },
    });

    const studentResultIndex = allResults.findIndex((r) => r.studentId === studentId);
    rank = studentResultIndex >= 0 ? studentResultIndex + 1 : null;
  }

  // Create or update result
  const existingResult = await prisma.result.findUnique({
    where: {
      examId_studentId: {
        examId,
        studentId,
      },
    },
  });

  let result;
  if (existingResult) {
    result = await prisma.result.update({
      where: { id: existingResult.id },
      data: {
        totalMarks,
        maxTotalMarks,
        percentage,
        cgpa,
        grade,
        isPass,
        rank,
        updatedBy: createdBy,
      },
    });
  } else {
    result = await prisma.result.create({
      data: {
        examId,
        studentId,
        classId,
        totalMarks,
        maxTotalMarks,
        percentage,
        cgpa,
        grade,
        isPass,
        rank,
        schoolId: exam.schoolId,
        createdBy,
      },
    });
  }

  return result;
};

/**
 * Calculate results for all students in a class
 * @param {string} examId - Exam ID
 * @param {string} classId - Class ID
 * @param {Object} gradeConfig - Grade configuration
 * @param {string} createdBy - User ID
 * @returns {Promise<{ calculated: number, results: Object[] }>}
 */
const calculateResultForClass = async (examId, classId, gradeConfig, createdBy) => {
  const profiles = await prisma.studentProfile.findMany({
    where: { classId, deletedAt: null },
    select: { userId: true },
  });
  const studentIds = profiles.map((p) => p.userId);
  const results = [];
  const errors = [];
  for (const studentId of studentIds) {
    try {
      const result = await calculateResult(examId, studentId, classId, gradeConfig, createdBy);
      results.push(result);
    } catch (err) {
      logger.warn({ err, examId, studentId, classId }, "Skipped one student in bulk calculate");
      errors.push({ studentId, message: err.message });
    }
  }
  return { calculated: results.length, total: studentIds.length, results, errors };
};

/**
 * Calculate grade from percentage
 * @param {number} percentage - Percentage
 * @param {Array} gradeRanges - Grade ranges configuration
 * @returns {string} - Grade
 */
const calculateGrade = (percentage, gradeRanges) => {
  // Default grade ranges if not provided
  const defaultRanges = [
    { min: 90, max: 100, grade: "A+" },
    { min: 80, max: 89, grade: "A" },
    { min: 70, max: 79, grade: "B+" },
    { min: 60, max: 69, grade: "B" },
    { min: 50, max: 59, grade: "C+" },
    { min: 40, max: 49, grade: "C" },
    { min: 33, max: 39, grade: "D" },
    { min: 0, max: 32, grade: "F" },
  ];

  const ranges = gradeRanges.length > 0 ? gradeRanges : defaultRanges;

  for (const range of ranges) {
    if (percentage >= range.min && percentage <= range.max) {
      return range.grade;
    }
  }

  return "F";
};

/**
 * Publish results
 * @param {string} examId - Exam ID
 * @param {string} classId - Class ID (optional, if null publishes for all classes)
 * @param {string} publishedBy - User ID publishing
 * @returns {Promise<Object>} - Publication result
 */
const publishResults = async (examId, classId, publishedBy) => {
  const where = {
    examId,
    deletedAt: null,
  };

  if (classId) {
    where.classId = classId;
  }

  // Update all results to published
  const result = await prisma.result.updateMany({
    where,
    data: {
      publishedAt: new Date(),
      publishedBy,
    },
  });

  // Get published results to send notifications
  const publishedResults = await prisma.result.findMany({
    where: {
      ...where,
      publishedAt: { not: null },
    },
    include: {
      student: {
        select: {
          id: true,
        },
      },
    },
  });

  // Send notifications to students and parents
  for (const result of publishedResults) {
    try {
      // Notify student
      await notificationService.createNotification({
        userId: result.studentId,
        title: "Results Published",
        content: `Your exam results have been published. Check your results now!`,
        type: "EXAM",
        actionUrl: `/results/${result.id}`,
        schoolId: result.schoolId,
        createdBy: publishedBy,
      });

      // Notify parents
      const parentLinks = await prisma.parentChildLink.findMany({
        where: {
          childId: result.studentId,
          deletedAt: null,
        },
        select: {
          parentId: true,
        },
      });

      for (const link of parentLinks) {
        await notificationService.createNotification({
          userId: link.parentId,
          title: "Child's Results Published",
          content: `Your child's exam results have been published. Check the results now!`,
          type: "EXAM",
          actionUrl: `/results/${result.id}`,
          schoolId: result.schoolId,
          createdBy: publishedBy,
        });
      }
    } catch (error) {
      logger.error({ error, resultId: result.id }, "Failed to send result publication notification");
    }
  }

  return {
    published: result.count,
    results: publishedResults,
  };
};

/**
 * Get student marks
 * @param {string} studentId - Student user ID
 * @param {string} examId - Exam ID (optional)
 * @returns {Promise<Array>} - Marks records
 */
const getStudentMarks = async (studentId, examId = null) => {
  const where = {
    studentId,
    deletedAt: null,
  };

  if (examId) {
    where.examId = examId;
  }

  return await prisma.marks.findMany({
    where,
    include: {
      exam: {
        select: {
          id: true,
          name: true,
          type: true,
          year: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
    },
    orderBy: {
      exam: {
        year: "desc",
      },
    },
  });
};

/**
 * Get exam marks
 * @param {string} examId - Exam ID
 * @param {string} classId - Class ID (optional)
 * @returns {Promise<Array>} - Marks records
 */
const getExamMarks = async (examId, classId = null) => {
  const where = {
    examId,
    deletedAt: null,
  };

  if (classId) {
    where.classId = classId;
  }

  return await prisma.marks.findMany({
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
            },
          },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
    },
    orderBy: [
      { student: { studentProfile: { rollNumber: "asc" } } },
      { subject: { name: "asc" } },
    ],
  });
};

/**
 * Get student results
 * @param {string} studentId - Student user ID
 * @param {string} examId - Exam ID (optional)
 * @returns {Promise<Array>} - Result records
 */
const getStudentResults = async (studentId, examId = null) => {
  const where = {
    studentId,
    deletedAt: null,
  };

  if (examId) {
    where.examId = examId;
  }

  return await prisma.result.findMany({
    where,
    include: {
      exam: {
        select: {
          id: true,
          name: true,
          type: true,
          year: true,
        },
      },
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
    },
    orderBy: {
      exam: {
        year: "desc",
      },
    },
  });
};

const marksService = {
  enterMarks,
  enterBulkMarks,
  calculateResult,
  calculateResultForClass,
  publishResults,
  getStudentMarks,
  getExamMarks,
  getStudentResults,
  calculateGrade,
};

export default marksService;

