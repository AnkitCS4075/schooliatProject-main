import prisma from "../prisma/client.js";
import { RoleName } from "../prisma/generated/index.js";

const schoolDetailSelect = {
  id: true,
  name: true,
  code: true,
  address: true,
  email: true,
  phone: true,
  certificateLink: true,
  logoId: true,
  gstNumber: true,
  principalName: true,
  principalEmail: true,
  principalPhone: true,
  establishedYear: true,
  boardAffiliation: true,
  studentStrength: true,
  bankName: true,
  bankAccountNumber: true,
  bankIfscCode: true,
  bankBranchName: true,
  upiId: true,
  regionId: true,
  region: { select: { id: true, name: true } },
  createdAt: true,
};

/**
 * Super-admin school record + aggregate stats for master data / profile UI.
 * @param {string} schoolId
 * @returns {Promise<{ school: object, stats: object } | null>}
 */
export async function getSchoolMasterOverview(schoolId) {
  const school = await prisma.school.findFirst({
    where: {
      id: schoolId,
      deletedAt: null,
      deletedBy: null,
    },
    select: schoolDetailSelect,
  });

  if (!school) {
    return null;
  }

  const activeSchoolScope = {
    schoolId,
    deletedAt: null,
    deletedBy: null,
  };

  const activeClassScope = {
    schoolId,
    deletedAt: null,
    deletedBy: null,
  };

  const [
    classCount,
    subjectCount,
    studentCount,
    teacherCount,
    staffCount,
    schoolAdminCount,
  ] = await Promise.all([
    prisma.class.count({ where: activeClassScope }),
    prisma.subject.count({ where: activeClassScope }),
    prisma.user.count({
      where: {
        ...activeSchoolScope,
        role: { name: RoleName.STUDENT },
      },
    }),
    prisma.user.count({
      where: {
        ...activeSchoolScope,
        role: { name: RoleName.TEACHER },
      },
    }),
    prisma.user.count({
      where: {
        ...activeSchoolScope,
        role: { name: RoleName.STAFF },
      },
    }),
    prisma.user.count({
      where: {
        ...activeSchoolScope,
        role: { name: RoleName.SCHOOL_ADMIN },
      },
    }),
  ]);

  return {
    school,
    stats: {
      classes: classCount,
      subjects: subjectCount,
      students: studentCount,
      teachers: teacherCount,
      staff: staffCount,
      schoolAdmins: schoolAdminCount,
    },
  };
}
