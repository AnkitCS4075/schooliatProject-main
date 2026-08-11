import prisma from "../prisma/client.js";

/**
 * Single class for school admin (scoped by schoolId). Includes class teacher and live student count.
 */
export async function getClassDetailForSchool(classId, schoolId) {
  let cls;
  try {
    cls = await prisma.class.findFirst({
      where: { id: classId, schoolId, deletedAt: null },
    });
  } catch (error) {
    const maybeMissingNewColumn =
      error?.code === "P2022" ||
      String(error?.message || "").includes("default_fee_components");
    if (!maybeMissingNewColumn) throw error;
    cls = await prisma.class.findFirst({
      where: { id: classId, schoolId, deletedAt: null },
      select: {
        id: true,
        grade: true,
        division: true,
        defaultAnnualFee: true,
        defaultMonthlyFee: true,
        schoolId: true,
        classTeacherId: true,
        createdBy: true,
        updatedBy: true,
        deletedBy: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    if (cls) cls = { ...cls, defaultFeeComponents: null };
  }

  if (!cls) return null;

  const [studentCount, classTeacher] = await Promise.all([
    prisma.studentProfile.count({
      where: {
        classId,
        deletedAt: null,
        user: { schoolId, deletedAt: null, deletedBy: null },
      },
    }),
    cls.classTeacherId
      ? prisma.user.findFirst({
          where: {
            id: cls.classTeacherId,
            deletedAt: null,
            deletedBy: null,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            contact: true,
          },
        })
      : Promise.resolve(null),
  ]);

  return {
    ...cls,
    studentCount,
    classTeacher,
  };
}

const SORT_FIELDS = new Set(["rollNumber", "name", "createdAt"]);

/**
 * Paginated students in a class (users with studentProfile for classId).
 */
export async function listStudentsInClass({
  classId,
  schoolId,
  pageNumber = 1,
  pageSize = 20,
  sortBy = "rollNumber",
  sortOrder = "asc",
  search = "",
}) {
  const classEntity = await prisma.class.findFirst({
    where: { id: classId, schoolId, deletedAt: null },
  });
  if (!classEntity) return null;

  const page = Math.max(1, pageNumber);
  const size = Math.min(100, Math.max(1, pageSize));
  const skip = (page - 1) * size;

  const order = sortOrder === "desc" ? "desc" : "asc";
  const field = SORT_FIELDS.has(sortBy) ? sortBy : "rollNumber";

  const searchTrim = typeof search === "string" ? search.trim() : "";
  const rollParsed = parseInt(searchTrim, 10);
  const rollExact =
    searchTrim !== "" && !Number.isNaN(rollParsed) && String(rollParsed) === searchTrim;

  const profileInClass = { classId, deletedAt: null };

  let where = {
    schoolId,
    deletedAt: null,
    deletedBy: null,
    studentProfile: { is: { ...profileInClass } },
  };

  if (rollExact) {
    where = {
      schoolId,
      deletedAt: null,
      deletedBy: null,
      studentProfile: {
        is: { ...profileInClass, rollNumber: rollParsed },
      },
    };
  } else if (searchTrim.length > 0) {
    where = {
      schoolId,
      deletedAt: null,
      deletedBy: null,
      AND: [
        { studentProfile: { is: { ...profileInClass } } },
        {
          OR: [
            { firstName: { contains: searchTrim, mode: "insensitive" } },
            { lastName: { contains: searchTrim, mode: "insensitive" } },
            ...(searchTrim.length > 1
              ? [{ publicUserId: { contains: searchTrim, mode: "insensitive" } }]
              : []),
          ],
        },
      ],
    };
  }

  let orderBy;
  if (field === "name") {
    orderBy = [{ firstName: order }, { lastName: order }];
  } else if (field === "createdAt") {
    orderBy = { createdAt: order };
  } else {
    // Numerical roll order, then name (A–Z) so ties / unset rolls (0) list predictably.
    orderBy = [
      { studentProfile: { rollNumber: order } },
      { firstName: "asc" },
      { lastName: "asc" },
    ];
  }

  const [rows, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: size,
      orderBy,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        contact: true,
        publicUserId: true,
        dateOfBirth: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            rollNumber: true,
            apaarId: true,
            classId: true,
            fatherName: true,
            motherName: true,
            class: { select: { grade: true, division: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / size));

  return {
    class: classEntity,
    students: rows,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    page,
    pageSize: size,
  };
}
