import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";
import prisma from "../prisma/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getGenderPronouns = (gender) => {
  const isMale = gender === "MALE";
  return {
    genderPronoun: isMale ? "his" : "her",
    genderPronounLower: isMale ? "he" : "she",
    genderPronounTitle: isMale ? "His" : "Her",
    genderPossessive: isMale ? "his" : "her",
    genderPronounObject: isMale ? "him" : "her",
  };
};

const generateExperienceCertificatePdf = async (userId, schoolId) => {
  try {
    const templatePath = path.join(__dirname, "../templates/experience-certificate.html");
    const htmlTemplate = await fs.readFile(templatePath, "utf-8");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        staffProfile: true,
      },
    });

    if (!user) throw new Error("User not found");

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) throw new Error("School not found");

    const isTeacher = !!user.teacherProfile;
    const profile = user.teacherProfile || user.staffProfile;

    let subjects = "";
    let classes = "";
    if (isTeacher) {
      const timetableSlots = await prisma.timetableSlot.findMany({
        where: { teacherId: userId, deletedAt: null },
        include: {
          subject: { select: { name: true } },
          timetable: {
            include: {
              class: { select: { grade: true, division: true } },
            },
          },
        },
      });

      const uniqueSubjects = [...new Set(timetableSlots.map((s) => s.subject.name))];
      const uniqueClasses = [...new Set(
        timetableSlots
          .filter((s) => s.timetable?.class)
          .map((s) => `${s.timetable.class.grade}${s.timetable.class.division ? `-${s.timetable.class.division}` : ""}`)
      )];

      subjects = uniqueSubjects.join(", ");
      classes = uniqueClasses.join(", ");
    }

    const pronouns = getGenderPronouns(user.gender);

    const year = new Date().getFullYear();
    const refCount = await prisma.user.count({
      where: { schoolId, deletedAt: null },
    });
    const refNumber = `${school.code || "SCH"}/EXP/${year}/${String(refCount).padStart(4, "0")}`;

    const template = Handlebars.compile(htmlTemplate);
    const data = {
      schoolName: school.name || "School",
      schoolAddress: Array.isArray(school.address) ? school.address.join(", ") : (school.address || ""),
      schoolPhone: school.phone || "",
      schoolEmail: school.email || "",
      schoolAffiliation: school.affiliationNumber || "",
      refNumber,
      date: formatDate(new Date()),
      employeeName: `${user.firstName} ${user.lastName || ""}`.trim().toUpperCase(),
      employeeId: user.publicUserId || "N/A",
      designation: profile?.designation || (isTeacher ? "Teacher" : "Staff"),
      joiningDate: formatDate(user.joiningDate || user.createdAt),
      relievingDate: formatDate(new Date()),
      subjects,
      classes,
      qualification: user.teacherProfile?.highestQualification || "N/A",
      university: user.teacherProfile?.university || "N/A",
      yearOfPassing: user.teacherProfile?.yearOfPassing || "N/A",
      ...pronouns,
    };

    const renderedHtml = template(data);

    const browser = await browserPool.acquire();
    let page;
    try {
      page = await browser.newPage();
      await page.setContent(renderedHtml, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
      });
      return Buffer.from(pdfBuffer);
    } finally {
      if (page) await page.close();
      browserPool.release(browser);
    }
  } catch (error) {
    logger.error({ error: error.message }, "Failed to generate experience certificate PDF");
    throw new Error("Failed to generate Experience Certificate PDF");
  }
};

const experienceCertificateService = {
  generateExperienceCertificatePdf,
};

export default experienceCertificateService;
