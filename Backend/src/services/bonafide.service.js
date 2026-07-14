import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";
import prisma from "../prisma/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generatePdf = async (studentId, schoolId, purpose, userId) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: { include: { class: true } }, school: true },
    });
    if (!student || !student.studentProfile) throw new Error("Student not found");

    const school = student.school || await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new Error("School not found");

    const settings = await prisma.settings.findFirst({ where: { schoolId, deletedAt: null } });

    const lastCert = await prisma.bonafideCertificate.findFirst({
      where: { schoolId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: { certificateNumber: true },
    });
    let nextSeq = 1;
    if (lastCert?.certificateNumber) {
      const match = lastCert.certificateNumber.match(/(\d+)$/);
      if (match) nextSeq = parseInt(match[1], 10) + 1;
    }
    const prefix = settings?.feeReceiptNumberPrefix || "BON";
    const certNumber = `${prefix}-BON-${String(nextSeq).padStart(5, "0")}`;

    const academicYear = new Date().getFullYear();
    const issueDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

    const templatePath = path.join(__dirname, "../templates/bonafide-certificate.html");
    const htmlTemplate = await fs.readFile(templatePath, "utf-8");

    const data = {
      schoolName: school.name,
      schoolAddress: Array.isArray(school.address) ? school.address.join(", ") : school.address || "",
      studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "N/A",
      admissionNo: student.publicUserId || "N/A",
      className: student.studentProfile.class.grade + (student.studentProfile.class.division ? ` - ${student.studentProfile.class.division}` : ""),
      academicYear,
      fatherName: student.studentProfile.fatherName || "N/A",
      motherName: student.studentProfile.motherName || "N/A",
      purpose: purpose.replace(/_/g, " "),
      issueDate,
      certificateNumber: certNumber,
      principalName: school.principalName || "The Principal",
    };

    const template = Handlebars.compile(htmlTemplate);
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

      const certificate = await prisma.bonafideCertificate.create({
        data: {
          studentId,
          schoolId,
          purpose,
          certificateNumber: certNumber,
          createdBy: userId,
        },
      });

      return { buffer: Buffer.from(pdfBuffer), certificate, certNumber };
    } finally {
      if (page) await page.close();
      browserPool.release(browser);
    }
  } catch (error) {
    logger.error({ error: error.message }, "Failed to generate bonafide certificate");
    throw error;
  }
};

const listCertificates = async (schoolId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { schoolId, deletedAt: null };
  const [certificates, total] = await Promise.all([
    prisma.bonafideCertificate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, publicUserId: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.bonafideCertificate.count({ where }),
  ]);

  return { certificates, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const bonafideService = { generatePdf, listCertificates };
export default bonafideService;
