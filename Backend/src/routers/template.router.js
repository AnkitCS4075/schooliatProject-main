import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import validateRequest from "../middlewares/validate-request.middleware.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import fileService from "../services/file.service.js";
import templateService from "../services/template.service.js";
import getTemplatesSchema from "../schemas/template/get-templates.schema.js";
import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_BASE_DIR = path.join(__dirname, "../templates");

const SAMPLE_DATA = {
  student: {
    id: "sample-id",
    firstName: "John",
    lastName: "Doe",
    name: "John Doe",
    publicId: "STU-2024001",
    dateOfBirth: new Date("2010-05-15"),
    idPhotoId: null,
    idPhotoSrc: "",
    contact: "+91 98765 43210",
    studentProfile: {
      rollNumber: "2024001",
      bloodGroup: "O+",
      fatherContact: "+91 98765 43210",
      motherContact: "+91 98765 43211",
      class: { grade: "10", division: "A" },
    },
  },
  class: { grade: "10", division: "A" },
  school: {
    name: "Sample Public School",
    address: ["123 Education Street", "Knowledge City, 560001"],
    phone: "+91 80 1234 5678",
    logoId: null,
    logoSrc: "",
  },
  studentName: "John Doe",
  rollNumber: "2024001",
  className: "10 - A",
  bloodGroup: "O+",
  dateOfBirth: "15/05/2010",
  schoolName: "Sample Public School",
  schoolAddress: "123 Education Street, Knowledge City, 560001",
  schoolPhone: "+91 80 1234 5678",
};

const extractDefaultsFromSchema = (schema) => {
  if (schema.type === "object" && schema.properties) {
    const result = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop.type === "object") {
        result[key] = extractDefaultsFromSchema(prop);
      } else if (prop.default !== undefined) {
        result[key] = prop.default;
      }
    }
    return result;
  }
  return schema.default;
};

const renderTemplateHtml = (templatePath) => {
  const templateDir = path.join(TEMPLATES_BASE_DIR, templatePath);
  const htmlPath = path.join(templateDir, "template.html");
  const cssPath = path.join(templateDir, "styles.css");
  const schemaPath = path.join(templateDir, "schema.json");

  if (!fs.existsSync(htmlPath) || !fs.existsSync(cssPath)) {
    return null;
  }

  const html = fs.readFileSync(htmlPath, "utf-8");
  const css = fs.readFileSync(cssPath, "utf-8");

  let config = {};
  if (fs.existsSync(schemaPath)) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
    config = extractDefaultsFromSchema(schema);
  }

  const compiled = Handlebars.compile(html);
  const rendered = compiled({ ...SAMPLE_DATA, config });
  return rendered.replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>${css}</style>`,
  );
};

const router = Router();

router.get(
  "/",
  withPermission(Permission.GET_SETTINGS),
  validateRequest(getTemplatesSchema),
  async (req, res) => {
    try {
      await templateService.syncTemplatesFromDisk();
      const { type } = req.query;
      const templates = await templateService.getTemplates(type);

      const templatesWithUrls = templates.map((template) => {
        let imageUrl = null;
        let sampleUrl = null;

        if (template.imageId) {
          try {
            imageUrl = fileService.attachFileURL({ id: template.imageId, extension: "png" }).url;
          } catch (e) {
            logger.warn({ templateId: template.id }, "Failed to attach image URL");
          }
        }

        if (template.sampleId) {
          try {
            sampleUrl = fileService.attachFileURL({ id: template.sampleId, extension: "pdf" }).url;
          } catch (e) {
            logger.warn({ templateId: template.id }, "Failed to attach sample URL");
          }
        }

        return {
          ...template,
          imageUrl,
          sampleUrl,
          previewUrl: `/api/v1/templates/${template.id}/preview`,
          downloadUrl: `/api/v1/templates/${template.id}/download`,
        };
      });

      return res.json({
        message: "Templates fetched successfully",
        data: templatesWithUrls,
      });
    } catch (error) {
      logger.error({ error: error.message }, "Failed to fetch templates");
      return res.status(500).json({
        message: "Failed to fetch templates",
      });
    }
  },
);

router.get(
  "/:templateId/preview",
  withPermission(Permission.GET_SETTINGS),
  async (req, res) => {
    try {
      const template = await templateService.getTemplateById(req.params.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const fullHtml = renderTemplateHtml(template.path);
      if (!fullHtml) {
        return res.status(404).json({ message: "Template files not found on disk" });
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(fullHtml);
    } catch (error) {
      logger.error({ error: error.message, templateId: req.params.templateId }, "Failed to generate preview");
      return res.status(500).json({ message: "Failed to generate template preview" });
    }
  },
);

router.get(
  "/:templateId/download",
  withPermission(Permission.GET_SETTINGS),
  async (req, res) => {
    try {
      const template = await templateService.getTemplateById(req.params.templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      const fullHtml = renderTemplateHtml(template.path);
      if (!fullHtml) {
        return res.status(404).json({ message: "Template files not found on disk" });
      }

      let browser;
      try {
        browser = await browserPool.acquire();
      } catch (e) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", `inline; filename="${template.title || "template"}-sample.html"`);
        return res.send(fullHtml);
      }

      try {
        const page = await browser.newPage();
        try {
          await page.setContent(fullHtml, { waitUntil: "load", timeout: 30000 });
          const pdfData = await page.pdf({ format: "A6", printBackground: true });
          const pdfBuffer = Buffer.from(pdfData);

          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `attachment; filename="${template.title || "template"}-sample.pdf"`);
          return res.send(pdfBuffer);
        } finally {
          await page.close().catch(() => {});
        }
      } finally {
        browserPool.release(browser);
      }
    } catch (error) {
      logger.error({ error: error.message, templateId: req.params.templateId }, "Failed to generate sample PDF");
      return res.status(500).json({ message: "Failed to generate sample PDF" });
    }
  },
);

router.get(
  "/:templateId/default",
  withPermission(Permission.GET_SETTINGS),
  async (req, res) => {
    const { templateId } = req.params;

    try {
      const defaults = await templateService.getTemplateDefaults(templateId);

      return res.json({
        message: "Template defaults fetched successfully",
        data: defaults,
      });
    } catch (error) {
      if (
        error.message === "Template not found" ||
        error.message.includes("Schema file not found")
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }
      return res.status(500).json({
        message: "Failed to fetch template defaults",
        error: error.message,
      });
    }
  },
);

export default router;
