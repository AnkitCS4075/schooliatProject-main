import prisma from "../prisma/client.js";
import ExcelJS from "exceljs";
import { renderBillingHtmlToPdfBuffer } from "../billing/billing-html-to-pdf.service.js";
import logger from "../config/logger.js";

function buildDateRangeWhere(filters = {}) {
  const where = {};
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }
  return where;
}

function formatExcelDate(val) {
  if (!val) return "";
  return new Date(val).toLocaleDateString("en-IN");
}

// ─── STUDENT REPORTS ──────────────────────────────────────────────────

async function getStudentProfiles(schoolId, filters = {}) {
  const where = { user: { schoolId }, deletedAt: null };
  if (filters.classId) where.classId = filters.classId;
  if (filters.studentId) where.id = filters.studentId;
  if (filters.search) {
    where.user = { ...where.user, OR: [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ] };
  }
  const students = await prisma.studentProfile.findMany({
    where,
    include: { class: { select: { id: true, grade: true, division: true } }, user: { select: { id: true, firstName: true, lastName: true, email: true, contact: true, schoolId: true } } },
    orderBy: { id: "asc" },
  });
  const statistics = { total: students.length };
  return { data: students, statistics };
}

async function getAdmissionRegister(schoolId, filters = {}) {
  const where = { user: { schoolId }, deletedAt: null };
  if (filters.classId) where.classId = filters.classId;
  if (filters.startDate || filters.endDate) {
    where.createdAt = buildDateRangeWhere(filters).createdAt;
  }
  const students = await prisma.studentProfile.findMany({
    where,
    include: { class: { select: { id: true, grade: true, division: true } }, user: { select: { firstName: true, lastName: true, email: true, contact: true } } },
    orderBy: { createdAt: "asc" },
  });
  const statistics = { total: students.length };
  return { data: students, statistics };
}

// ─── FEE REPORTS ──────────────────────────────────────────────────────

async function getFeeCollection(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null, paymentStatus: "PAID" };
  if (filters.classId) {
    const studentIds = (await prisma.studentProfile.findMany({ where: { classId: filters.classId, user: { schoolId } }, select: { userId: true } })).map(s => s.userId);
    where.studentId = { in: studentIds };
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = buildDateRangeWhere(filters).createdAt;
  }
  const installments = await prisma.feeInstallements.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = {
    total: installments.length,
    totalAmount: installments.reduce((sum, i) => sum + (i.amount || 0), 0),
    paidAmount: installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0),
  };
  return { data: installments, statistics };
}

async function getPendingFees(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null, paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] } };
  if (filters.classId) {
    const studentIds = (await prisma.studentProfile.findMany({ where: { classId: filters.classId, user: { schoolId } }, select: { userId: true } })).map(s => s.userId);
    where.studentId = { in: studentIds };
  }
  const installments = await prisma.feeInstallements.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = {
    total: installments.length,
    totalPending: installments.reduce((sum, i) => sum + (i.remainingAmount || 0), 0),
  };
  return { data: installments, statistics };
}

async function getOverdueFees(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null, paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] } };
  if (filters.classId) {
    const studentIds = (await prisma.studentProfile.findMany({ where: { classId: filters.classId, user: { schoolId } }, select: { userId: true } })).map(s => s.userId);
    where.studentId = { in: studentIds };
  }
  const installments = await prisma.feeInstallements.findMany({ where, orderBy: { createdAt: "asc" } });
  const statistics = {
    total: installments.length,
    overdueAmount: installments.reduce((sum, i) => sum + (i.remainingAmount || 0), 0),
  };
  return { data: installments, statistics };
}

// ─── ATTENDANCE REPORTS ───────────────────────────────────────────────

async function getStudentAttendance(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null };
  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.classId) where.classId = filters.classId;
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }
  const attendance = await prisma.attendance.findMany({ where, orderBy: { date: "desc" } });
  const statistics = {
    total: attendance.length,
    present: attendance.filter(a => a.status === "PRESENT").length,
    absent: attendance.filter(a => a.status === "ABSENT").length,
    late: attendance.filter(a => a.status === "LATE").length,
    rate: attendance.length > 0 ? ((attendance.filter(a => a.status === "PRESENT").length / attendance.length) * 100).toFixed(1) : "0",
  };
  return { data: attendance, statistics };
}

// ─── ACADEMIC REPORTS ────────────────────────────────────────────────

async function getMarksReport(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null };
  if (filters.classId) where.classId = filters.classId;
  if (filters.examId) where.examId = filters.examId;
  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.studentId) where.studentId = filters.studentId;
  const marks = await prisma.marks.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = {
    total: marks.length,
    average: marks.length > 0 ? (marks.reduce((s, m) => s + parseFloat(String(m.percentage || 0)), 0) / marks.length).toFixed(1) : "0",
  };
  return { data: marks, statistics };
}

// ─── INVENTORY REPORTS ───────────────────────────────────────────────

async function getInventoryReport(schoolId) {
  const items = await prisma.inventoryItem.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { itemName: "asc" },
  });
  const statistics = {
    total: items.length,
    totalStock: items.reduce((s, i) => s + (i.totalStock || 0), 0),
    totalIssued: items.reduce((s, i) => s + (i.issuedQty || 0), 0),
  };
  return { data: items, statistics };
}

// ─── COURIER REPORTS ─────────────────────────────────────────────────

async function getCourierReport(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null };
  if (filters.startDate || filters.endDate) {
    where.createdAt = buildDateRangeWhere(filters).createdAt;
  }
  const couriers = await prisma.schoolCourier.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = { total: couriers.length };
  return { data: couriers, statistics };
}

// ─── GATE ENTRY REPORTS ──────────────────────────────────────────────

async function getGateEntryReport(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null };
  if (filters.startDate || filters.endDate) {
    where.createdAt = buildDateRangeWhere(filters).createdAt;
  }
  const entries = await prisma.gateEntry.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = {
    total: entries.length,
    checkIns: entries.filter(e => !e.outTime).length,
    checkOuts: entries.filter(e => !!e.outTime).length,
  };
  return { data: entries, statistics };
}

// ─── GRIEVANCE REPORTS ──────────────────────────────────────────────

async function getGrievanceReport(schoolId, filters = {}) {
  const where = { schoolId };
  if (filters.status) where.status = filters.status;
  const grievances = await prisma.grievance.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = {
    total: grievances.length,
    open: grievances.filter(g => g.status === "OPEN").length,
    inProgress: grievances.filter(g => g.status === "IN_PROGRESS").length,
    resolved: grievances.filter(g => g.status === "RESOLVED").length,
  };
  return { data: grievances, statistics };
}

// ─── QUOTATION REPORTS ───────────────────────────────────────────────

async function getQuotationReport(schoolId, filters = {}) {
  const where = { schoolId, deletedAt: null };
  if (filters.status) where.status = filters.status;
  if (filters.startDate || filters.endDate) {
    where.createdAt = buildDateRangeWhere(filters).createdAt;
  }
  const quotations = await prisma.quotation.findMany({ where, orderBy: { createdAt: "desc" } });
  const statistics = {
    total: quotations.length,
    totalValue: quotations.reduce((s, q) => s + parseFloat(String(q.totalAmount || 0)), 0),
    converted: quotations.filter(q => q.status === "CONVERTED").length,
    conversionRate: quotations.length > 0 ? ((quotations.filter(q => q.status === "CONVERTED").length / quotations.length) * 100).toFixed(1) : "0",
  };
  return { data: quotations, statistics };
}

// ─── LIBRARY REPORTS ─────────────────────────────────────────────────

async function getLibraryReport(schoolId) {
  const books = await prisma.libraryBook.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { title: "asc" },
  });
  const statistics = {
    totalBooks: books.length,
    totalCopies: books.reduce((s, b) => s + (b.totalCopies || 0), 0),
    available: books.reduce((s, b) => s + (b.availableCopies || 0), 0),
  };
  return { data: books, statistics };
}

// ─── REPORT REGISTRY ─────────────────────────────────────────────────

const reportRegistry = {
  "students/profile": getStudentProfiles,
  "students/admission": getAdmissionRegister,
  "fees/collection": getFeeCollection,
  "fees/pending": getPendingFees,
  "fees/overdue": getOverdueFees,
  "attendance/student": getStudentAttendance,
  "academics/marks": getMarksReport,
  "inventory/stock": getInventoryReport,
  "couriers": getCourierReport,
  "gate-entries": getGateEntryReport,
  "complaints": getGrievanceReport,
  "quotations": getQuotationReport,
  "library": getLibraryReport,
};

async function getReport(reportType, schoolId, filters = {}) {
  const handler = reportRegistry[reportType];
  if (!handler) throw new Error(`Unknown report type: ${reportType}`);
  return handler(schoolId, filters);
}

// ─── EXCEL EXPORT ────────────────────────────────────────────────────

async function exportToExcel(data, columns, title) {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SchooliAT";
    workbook.created = new Date();
    const sheetName = title.replace(/[\/\\:*?<>|[\]]/g, "-").slice(0, 31);
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns.map(col => ({ header: col.label, key: col.key, width: col.width || 20 }));
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    for (const row of data) {
      const values = {};
      for (const col of columns) {
        let val = row[col.key];
        if (val === null || val === undefined) {
          values[col.key] = "";
          continue;
        }
        if (val instanceof Date) {
          values[col.key] = formatExcelDate(val);
          continue;
        }
        if (typeof val === "bigint") {
          values[col.key] = Number(val);
          continue;
        }
        if (typeof val === "object") {
          try {
            values[col.key] = JSON.stringify(val);
          } catch {
            values[col.key] = "[Object]";
          }
          continue;
        }
        values[col.key] = String(val);
      }
      sheet.addRow(values);
    }
    if (data.length > 0) {
      sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + columns.length)}1` };
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, "exportToExcel error");
    throw error;
  }
}

// ─── CSV EXPORT ──────────────────────────────────────────────────────

function exportToCsv(data, columns) {
  const header = columns.map(c => `"${c.label}"`).join(",");
  const rows = data.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = "";
      if (val instanceof Date) val = formatExcelDate(val);
      if (typeof val === "object" && val !== null) val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(",");
  });
  return [header, ...rows].join("\n");
}

// ─── HTML TABLE (for PDF) ────────────────────────────────────────────

function buildReportHtmlTable(data, columns, title) {
  const headerCells = columns.map(c => `<th style="background:#1e40af;color:#fff;padding:8px 12px;text-align:left;font-size:10pt;">${c.label}</th>`).join("");
  const bodyRows = data.map(row => {
    const cells = columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = "";
      if (val instanceof Date) val = formatExcelDate(val);
      if (typeof val === "object" && val !== null) val = JSON.stringify(val);
      return `<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:9pt;">${String(val)}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<!DOCTYPE html><html><head><style>body{font-family:'Segoe UI',sans-serif;padding:20px;}table{width:100%;border-collapse:collapse;}tr:nth-child(even){background:#f9fafb;}</style></head><body>
    <h2 style="color:#1e40af;margin-bottom:10px;">${title}</h2>
    <p style="color:#666;font-size:9pt;">Generated on ${new Date().toLocaleDateString("en-IN")} | Total: ${data.length} records</p>
    <table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
  </body></html>`;
}

// ─── COLUMN DEFINITIONS ──────────────────────────────────────────────

const columnDefinitions = {
  "students/profile": [
    { key: "user_firstName", label: "First Name", width: 18 },
    { key: "user_lastName", label: "Last Name", width: 18 },
    { key: "user_email", label: "Email", width: 28 },
    { key: "user_contact", label: "Phone", width: 15 },
    { key: "class_grade", label: "Grade", width: 10 },
    { key: "class_division", label: "Section", width: 10 },
    { key: "createdAt", label: "Enrolled", width: 14 },
  ],
  "students/admission": [
    { key: "user_firstName", label: "First Name", width: 18 },
    { key: "user_lastName", label: "Last Name", width: 18 },
    { key: "class_grade", label: "Grade", width: 10 },
    { key: "class_division", label: "Section", width: 10 },
    { key: "createdAt", label: "Admission Date", width: 16 },
  ],
  "fees/collection": [
    { key: "studentId", label: "Student ID", width: 28 },
    { key: "amount", label: "Amount", width: 14 },
    { key: "paidAmount", label: "Paid", width: 14 },
    { key: "paymentStatus", label: "Status", width: 12 },
    { key: "createdAt", label: "Date", width: 14 },
  ],
  "fees/pending": [
    { key: "studentId", label: "Student ID", width: 28 },
    { key: "amount", label: "Amount", width: 14 },
    { key: "remainingAmount", label: "Remaining", width: 14 },
    { key: "paymentStatus", label: "Status", width: 12 },
  ],
  "fees/overdue": [
    { key: "studentId", label: "Student ID", width: 28 },
    { key: "amount", label: "Amount", width: 14 },
    { key: "remainingAmount", label: "Remaining", width: 14 },
    { key: "paymentStatus", label: "Status", width: 12 },
  ],
  "attendance/student": [
    { key: "studentId", label: "Student ID", width: 28 },
    { key: "date", label: "Date", width: 14 },
    { key: "status", label: "Status", width: 12 },
  ],
  "academics/marks": [
    { key: "studentId", label: "Student ID", width: 28 },
    { key: "subjectId", label: "Subject", width: 20 },
    { key: "examId", label: "Exam", width: 20 },
    { key: "marksObtained", label: "Marks", width: 12 },
    { key: "maxMarks", label: "Max", width: 12 },
    { key: "percentage", label: "%", width: 10 },
  ],
  "inventory/stock": [
    { key: "itemName", label: "Item", width: 30 },
    { key: "itemCode", label: "Code", width: 16 },
    { key: "category", label: "Category", width: 20 },
    { key: "totalStock", label: "Stock", width: 10 },
    { key: "issuedQty", label: "Issued", width: 10 },
    { key: "condition", label: "Condition", width: 14 },
  ],
  "complaints": [
    { key: "title", label: "Title", width: 30 },
    { key: "status", label: "Status", width: 12 },
    { key: "priority", label: "Priority", width: 12 },
    { key: "createdAt", label: "Date", width: 14 },
  ],
  "quotations": [
    { key: "quotationNumber", label: "Quotation #", width: 16 },
    { key: "customerName", label: "Customer", width: 22 },
    { key: "totalAmount", label: "Amount", width: 14 },
    { key: "status", label: "Status", width: 14 },
    { key: "createdAt", label: "Date", width: 14 },
  ],
  "library": [
    { key: "title", label: "Title", width: 30 },
    { key: "author", label: "Author", width: 22 },
    { key: "isbn", label: "ISBN", width: 18 },
    { key: "totalCopies", label: "Copies", width: 10 },
    { key: "availableCopies", label: "Available", width: 10 },
  ],
  "gate-entries": [
    { key: "name", label: "Person", width: 22 },
    { key: "category", label: "Category", width: 14 },
    { key: "reason", label: "Purpose", width: 22 },
    { key: "inTime", label: "In Time", width: 18 },
    { key: "outTime", label: "Out Time", width: 18 },
  ],
  "couriers": [
    { key: "trackingNumber", label: "Tracking #", width: 22 },
    { key: "provider", label: "Provider", width: 18 },
    { key: "recipient", label: "Recipient", width: 18 },
    { key: "status", label: "Status", width: 14 },
    { key: "dispatchDate", label: "Dispatch", width: 14 },
  ],
};

function getColumns(reportType) {
  return columnDefinitions[reportType] || [
    { key: "id", label: "ID", width: 28 },
    { key: "createdAt", label: "Date", width: 14 },
  ];
}

function flattenForExport(data) {
  return data.map(item => {
    const flat = {};
    for (const [key, val] of Object.entries(item)) {
      if (key.startsWith("_") || typeof val === "function") continue;
      if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        for (const [subKey, subVal] of Object.entries(val)) {
          if (typeof subVal === "function") continue;
          if (subVal && typeof subVal === "object" && !(subVal instanceof Date) && !Array.isArray(subVal)) {
            flat[`${key}_${subKey}`] = String(subVal);
          } else {
            flat[`${key}_${subKey}`] = subVal;
          }
        }
      } else if (Array.isArray(val)) {
        flat[key] = JSON.stringify(val);
      } else {
        flat[key] = val;
      }
    }
    return flat;
  });
}

export {
  getReport,
  exportToExcel,
  exportToCsv,
  buildReportHtmlTable,
  getColumns,
  flattenForExport,
  reportRegistry,
};
