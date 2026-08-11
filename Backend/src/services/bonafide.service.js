import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import Handlebars from "handlebars";
import browserPool from "../utils/browser-pool.util.js";
import { uploadFile } from "../config/storage/index.js";
import logger from "../config/logger.js";
import prisma from "../prisma/client.js";
import fileService from "./file.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "../templates/bonafide-certificate.html");

const PURPOSE_LABELS = {
  PASSPORT: "Passport",
  SCHOLARSHIP: "Scholarship",
  BANK: "Bank",
  VISA: "Visa",
  GENERAL: "General",
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  if (now.getMonth() >= 3) {
    return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
  }
  return `${year - 1}-${String(year % 100).padStart(2, "0")}`;
};

const lightenHex = (hex, factor = 0.9) => {
  const clean = String(hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#eef1f7";
  const num = parseInt(clean, 16);
  const r = Math.round(((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * factor);
  const g = Math.round(((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * factor);
  const b = Math.round((num & 255) + (255 - (num & 255)) * factor);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const computeNextCertificateNumber = async (schoolId, schoolCode) => {
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

  const prefix = String(schoolCode || "BON").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${prefix}-BON-${String(nextSeq).padStart(5, "0")}`;
};

const getOriginalIssueDate = async (studentId, schoolId, purpose) => {
  const original = await prisma.bonafideCertificate.findFirst({
    where: { studentId, schoolId, purpose, isDuplicate: false, deletedAt: null },
    orderBy: { issueDate: "asc" },
    select: { issueDate: true },
  });
  return original ? formatDate(original.issueDate) : formatDate(new Date());
};

const buildCertificateData = async ({
  studentId,
  schoolId,
  purpose,
  isDuplicate,
  certificateNumber,
  issueDate,
}) => {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: { include: { class: true } },
      school: true,
    },
  });
  if (!student || !student.studentProfile) throw new Error("Student not found");

  const school =
    student.school ||
    (await prisma.school.findUnique({ where: { id: schoolId } }));
  if (!school) throw new Error("School not found");

  const settings = await prisma.settings.findFirst({
    where: { schoolId, deletedAt: null },
  });

  const primaryColor = settings?.themePrimaryColor || "#1a3c6e";
  const logoId = settings?.logoId || school.logoId || null;
  const schoolLogo = logoId
    ? fileService.attachFileURL({ id: logoId, extension: "jpg" }).url
    : null;

  const purposeLabel = PURPOSE_LABELS[purpose] || purpose.replace(/_/g, " ");
  const issueDateText = issueDate || formatDate(new Date());
  const certNumber = certificateNumber || (await computeNextCertificateNumber(schoolId, school.code));
  const className = student.studentProfile.class
    ? `${student.studentProfile.class.grade}${
        student.studentProfile.class.division
          ? ` - ${student.studentProfile.class.division}`
          : ""
      }`
    : "N/A";

  return {
    schoolName: school.name || "School",
    schoolAddress: Array.isArray(school.address)
      ? school.address.join(", ")
      : school.address || "",
    affiliation: school.boardAffiliation || "",
    logoInitial: (school.name || "S").trim().charAt(0).toUpperCase(),
    schoolLogo,
    primaryColor,
    tintColor: lightenHex(primaryColor),
    duplicateWatermarkColor: "#b91c1c",
    duplicateColor: "#b91c1c",
    certTitle: isDuplicate ? "Duplicate Bonafide Certificate" : "Bonafide Certificate",
    subTitle: "Certificate of Student Status",
    certificateNumber: certNumber,
    issueDate: issueDateText,
    studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
    fatherName: student.studentProfile.fatherName || "N/A",
    motherName: student.studentProfile.motherName || "N/A",
    dateOfBirth: formatDate(student.dateOfBirth),
    className,
    rollNumber: student.studentProfile.rollNumber ?? "N/A",
    admissionNo: student.publicUserId || "N/A",
    academicYear: getAcademicYear(),
    purpose: purposeLabel,
    place: Array.isArray(school.address) && school.address[0] ? school.address[0] : school.name,
    stampImage: settings?.stampImageUrl || null,
    signatureImage: settings?.signatureImageUrl || null,
    principalName:
      settings?.signatureName || school.principalName || "The Principal",
    principalDesignation: settings?.signatureDesignation || "Principal",
    isDuplicate: Boolean(isDuplicate),
    originalIssueDate: isDuplicate
      ? await getOriginalIssueDate(studentId, schoolId, purpose)
      : null,
  };
};

let compiledTemplate = null;
const renderCertificateHtml = async (data) => {
  if (!compiledTemplate) {
    const htmlTemplate = await fs.readFile(TEMPLATE_PATH, "utf-8");
    compiledTemplate = Handlebars.compile(htmlTemplate);
  }
  return compiledTemplate(data);
};

const renderPdfBuffer = async (html) => {
  const browser = await browserPool.acquire();
  let page;
  try {
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
    return Buffer.from(pdfData);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {
        // Page might already be closed
      }
    }
    browserPool.release(browser);
  }
};

const uploadAndCreateFileEntry = async (buffer, name, contentType, createdBy) => {
  const fileId = crypto.randomUUID();
  const extension = "pdf";
  await uploadFile({ buffer, key: `${fileId}.${extension}`, contentType });

  const file = await prisma.file.create({
    data: {
      id: fileId,
      name,
      extension,
      contentType,
      size: buffer.length,
      createdBy,
    },
  });

  return file;
};

const generatePdf = async ({ studentId, schoolId, purpose, userId, isDuplicate }) => {
  try {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const certNumber = await computeNextCertificateNumber(schoolId, school?.code);

    const data = await buildCertificateData({
      studentId,
      schoolId,
      purpose,
      isDuplicate: Boolean(isDuplicate),
      certificateNumber: certNumber,
    });

    const html = await renderCertificateHtml(data);
    const buffer = await renderPdfBuffer(html);

    const file = await uploadAndCreateFileEntry(
      buffer,
      `bonafide-${certNumber}.pdf`,
      "application/pdf",
      userId,
    );

    const certificate = await prisma.bonafideCertificate.create({
      data: {
        studentId,
        schoolId,
        purpose,
        certificateNumber: certNumber,
        isDuplicate: Boolean(isDuplicate),
        fileId: file.id,
        createdBy: userId,
      },
    });

    return { buffer, certificate, certNumber, data };
  } catch (error) {
    logger.error({ error: error.message }, "Failed to generate bonafide certificate");
    throw error;
  }
};

const getPreview = async ({ studentId, schoolId, purpose, isDuplicate }) => {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  const previewNumber = await computeNextCertificateNumber(schoolId, school?.code);

  const data = await buildCertificateData({
    studentId,
    schoolId,
    purpose,
    isDuplicate: Boolean(isDuplicate),
    certificateNumber: previewNumber,
  });

  const html = await renderCertificateHtml(data);
  return { html, certificateNumber: previewNumber, data };
};

const getCertificatePdf = async ({ certificateId, schoolId }) => {
  const certificate = await prisma.bonafideCertificate.findFirst({
    where: { id: certificateId, schoolId, deletedAt: null },
  });
  if (!certificate) throw new Error("Certificate not found");

  const data = await buildCertificateData({
    studentId: certificate.studentId,
    schoolId: certificate.schoolId,
    purpose: certificate.purpose,
    isDuplicate: certificate.isDuplicate,
    certificateNumber: certificate.certificateNumber,
    issueDate: certificate.issueDate,
  });

  const html = await renderCertificateHtml(data);
  const buffer = await renderPdfBuffer(html);

  return { buffer, certificate, certNumber: certificate.certificateNumber, data };
};

const listCertificates = async (schoolId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { schoolId, deletedAt: null };

  if (options.studentId) where.studentId = options.studentId;
  if (options.purpose) where.purpose = options.purpose;
  if (options.isDuplicate !== undefined && options.isDuplicate !== "") {
    where.isDuplicate = options.isDuplicate === "true";
  }

  const [certificates, total] = await Promise.all([
    prisma.bonafideCertificate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            publicUserId: true,
            studentProfile: {
              select: {
                rollNumber: true,
                class: { select: { grade: true, division: true } },
              },
            },
          },
        },
        creator: { select: { id: true, firstName: true, lastName: true } },
        file: { select: { id: true, extension: true } },
      },
    }),
    prisma.bonafideCertificate.count({ where }),
  ]);

  return { certificates, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const bonafideService = {
  generatePdf,
  getPreview,
  getCertificatePdf,
  listCertificates,
};

export default bonafideService;
