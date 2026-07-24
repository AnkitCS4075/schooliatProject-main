import { Router } from "express";
import { Permission } from "../prisma/generated/index.js";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import {
  getReport,
  exportToExcel,
  exportToCsv,
  buildReportHtmlTable,
  getColumns,
  flattenForExport,
  reportRegistry,
} from "../services/enhanced-reports.service.js";
import { renderBillingHtmlToPdfBuffer } from "../billing/billing-html-to-pdf.service.js";
import logger from "../config/logger.js";

const router = Router();

function extractType(req) {
  return req.query.type || req.params.type;
}

function extractFilters(req) {
  return {
    classId: req.query.classId,
    studentId: req.query.studentId,
    examId: req.query.examId,
    subjectId: req.query.subjectId,
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    search: req.query.search,
  };
}

// List available report types
router.get(
  "/reports/types",
  withPermission(Permission.GET_REPORTS),
  async (req, res) => {
    try {
      const types = Object.keys(reportRegistry).map(key => ({
        id: key,
        name: key.split("/").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" > "),
      }));
      return res.status(200).json({ message: "Report types retrieved", data: types });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch report types" });
    }
  },
);

// Get report data (JSON) — uses ?type=students/profile query param
router.get(
  "/reports/data",
  withPermission(Permission.GET_REPORTS),
  async (req, res) => {
    try {
      const type = extractType(req);
      if (!type) return res.status(400).json({ message: "type query parameter is required" });
      const currentUser = req.context.user;
      const result = await getReport(type, currentUser.schoolId, extractFilters(req));
      return res.status(200).json({
        message: "Report retrieved",
        data: result.data,
        statistics: result.statistics,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to generate report" });
    }
  },
);

// Export report as Excel — uses ?type=students/profile query param
router.get(
  "/reports/export/excel",
  withPermission(Permission.EXPORT_REPORTS),
  async (req, res) => {
    try {
      const type = extractType(req);
      if (!type) return res.status(400).json({ message: "type query parameter is required" });
      const currentUser = req.context.user;
      const result = await getReport(type, currentUser.schoolId, extractFilters(req));
      const columns = getColumns(type);
      const flatData = flattenForExport(result.data);
      const buffer = await exportToExcel(flatData, columns, type);
      const filename = `${type.replace(/\//g, "-")}-report.xlsx`;
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(buffer);
    } catch (error) {
      logger.error({ error: error.message, stack: error.stack }, "Excel export failed");
      return res.status(400).json({ message: error.message || "Export failed" });
    }
  },
);

// Export report as CSV
router.get(
  "/reports/export/csv",
  withPermission(Permission.EXPORT_REPORTS),
  async (req, res) => {
    try {
      const type = extractType(req);
      if (!type) return res.status(400).json({ message: "type query parameter is required" });
      const currentUser = req.context.user;
      const result = await getReport(type, currentUser.schoolId, extractFilters(req));
      const columns = getColumns(type);
      const flatData = flattenForExport(result.data);
      const csv = exportToCsv(flatData, columns);
      const filename = `${type.replace(/\//g, "-")}-report.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(csv);
    } catch (error) {
      return res.status(400).json({ message: error.message || "Export failed" });
    }
  },
);

// Export report as PDF
router.get(
  "/reports/export/pdf",
  withPermission(Permission.EXPORT_REPORTS),
  async (req, res) => {
    try {
      const type = extractType(req);
      if (!type) return res.status(400).json({ message: "type query parameter is required" });
      const currentUser = req.context.user;
      const result = await getReport(type, currentUser.schoolId, extractFilters(req));
      const columns = getColumns(type);
      const flatData = flattenForExport(result.data);
      const title = type.split("/").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" > ") + " Report";
      const html = buildReportHtmlTable(flatData, columns, title);
      const pdfBuffer = await renderBillingHtmlToPdfBuffer(html);
      const filename = `${type.replace(/\//g, "-")}-report.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } catch (error) {
      logger.error({ error }, "PDF export failed");
      return res.status(400).json({ message: error.message || "Export failed" });
    }
  },
);

// ─── Report Templates ────────────────────────────────────────────────

router.post(
  "/report-templates",
  withPermission(Permission.EXPORT_REPORTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { name, reportType, columns: cols, filters } = req.body.request || {};
      if (!name || !reportType) {
        return res.status(400).json({ message: "Name and reportType are required" });
      }

      const template = await prisma.reportTemplate.create({
        data: {
          name,
          reportType,
          schoolId: currentUser.schoolId,
          columns: cols || [],
          filters: filters || {},
          createdBy: currentUser.id,
        },
      });
      return res.status(201).json({ message: "Template saved", data: template });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to save template" });
    }
  },
);

router.get(
  "/report-templates",
  withPermission(Permission.GET_REPORTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const templates = await prisma.reportTemplate.findMany({
        where: {
          schoolId: currentUser.schoolId,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ message: "Templates retrieved", data: templates });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch templates" });
    }
  },
);

router.delete(
  "/report-templates/:id",
  withPermission(Permission.EXPORT_REPORTS),
  async (req, res) => {
    try {
      await prisma.reportTemplate.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      return res.status(200).json({ message: "Template deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to delete template" });
    }
  },
);

export default router;
