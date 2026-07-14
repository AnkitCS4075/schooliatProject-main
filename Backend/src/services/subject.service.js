import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/**
 * Get subjects for a school
 * @param {string} schoolId - School ID
 * @param {Object} options - Filter and pagination options
 * @returns {Promise<Object>} - Subjects list and total count
 */
/** Aligned with dashboard (homework, notes, syllabus) which request large subject lists. */
const SUBJECTS_MAX_PAGE_SIZE = 1000;

function normalizeOptionalText(value) {
  if (value === undefined || value === null) return null;
  const t = String(value).trim();
  return t.length > 0 ? t : null;
}

const getSubjects = async (schoolId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  if (!schoolId || typeof schoolId !== "string") {
    throw new Error("School context is required to fetch subjects");
  }

  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(
    SUBJECTS_MAX_PAGE_SIZE,
    Math.max(1, Number(limit) || 20),
  );
  const skip = (pageNumber - 1) * limitNumber;

  const where = {
    schoolId,
    deletedAt: null,
  };

  const [subjects, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limitNumber,
      // Newest first matches admin CRUD expectations (new subject visible on page 1).
      orderBy: [{ createdAt: "desc" }, { name: "asc" }, { id: "asc" }],
    }),
    prisma.subject.count({ where }),
  ]);

  return {
    subjects,
    total,
    totalPages: Math.max(1, Math.ceil(total / limitNumber)),
    page: pageNumber,
    limit: limitNumber,
  };
};

/**
 * Create a new subject
 * @param {Object} data - Subject data
 * @param {string} data.name - Subject name
 * @param {string} data.code - Subject code (optional)
 * @param {string} data.description - Subject description (optional)
 * @param {string} data.schoolId - School ID
 * @param {string} data.createdBy - User ID of creator
 * @returns {Promise<Object>} - Created subject
 */
const createSubject = async (data) => {
  if (!data?.schoolId || typeof data.schoolId !== "string") {
    throw new Error("School context is required to create a subject");
  }
  if (!data?.createdBy || typeof data.createdBy !== "string") {
    throw new Error("Creator context is required to create a subject");
  }

  const name = String(data.name ?? "").trim();
  if (!name) {
    throw new Error("Subject name is required");
  }

  const payload = {
    name,
    code: normalizeOptionalText(data.code),
    description: normalizeOptionalText(data.description),
    schoolId: data.schoolId,
    createdBy: data.createdBy,
  };

  try {
    return await prisma.subject.create({
      data: payload,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      const target = error?.meta?.target;
      const fields = Array.isArray(target) ? target.join(",") : "";
      if (fields.includes("name") || String(error?.message || "").includes("name")) {
        throw new Error(
          "A subject with this name already exists for your school. Use a different name or edit the existing subject.",
        );
      }
      throw new Error("Could not create subject due to a duplicate or conflict.");
    }
    logger.error({ err: error }, "createSubject prisma error");
    throw error;
  }
};

/**
 * Update an existing subject
 * @param {string} id - Subject ID
 * @param {Object} data - Subject data to update
 * @param {string} schoolId - School ID to verify ownership
 * @param {string} updatedBy - User ID of updater
 * @returns {Promise<Object>} - Updated subject
 */
const updateSubject = async (id, data, schoolId, updatedBy) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
  });

  if (!subject || subject.schoolId !== schoolId || subject.deletedAt) {
    throw new Error("Subject not found");
  }

  const patch = {};
  if (data.name !== undefined) {
    const n = String(data.name ?? "").trim();
    if (!n) {
      throw new Error("Subject name cannot be empty");
    }
    patch.name = n;
  }
  if (data.code !== undefined) {
    patch.code = normalizeOptionalText(data.code);
  }
  if (data.description !== undefined) {
    patch.description = normalizeOptionalText(data.description);
  }

  try {
    return await prisma.subject.update({
      where: { id },
      data: {
        ...patch,
        updatedBy,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw new Error(
        "A subject with this name already exists for your school. Choose a different name.",
      );
    }
    throw error;
  }
};

/**
 * Delete a subject
 * @param {string} id - Subject ID
 * @param {string} schoolId - School ID to verify ownership
 * @param {string} deletedBy - User ID of deleter
 * @returns {Promise<Object>} - Deleted subject
 */
const deleteSubject = async (id, schoolId, deletedBy) => {
    const subject = await prisma.subject.findUnique({
        where: { id },
    });

    if (!subject || subject.schoolId !== schoolId || subject.deletedAt) {
        throw new Error("Subject not found");
    }

    // Soft delete
    return await prisma.subject.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletedBy,
        },
    });
};

const subjectService = {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
};

export default subjectService;
