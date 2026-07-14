import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import archiver from "archiver";
import crypto from "crypto";
import prisma from "../prisma/client.js";
import { uploadFile } from "../config/storage/index.js";
import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_BASE_DIR = path.join(__dirname, "../templates");

// Read and compile template files
const loadTemplate = (template) => {
  const htmlPath = path.join(
    TEMPLATES_BASE_DIR,
    template.path,
    "template.html",
  );
  const cssPath = path.join(TEMPLATES_BASE_DIR, template.path, "styles.css");

  const html = fs.readFileSync(htmlPath, "utf-8");
  const css = fs.readFileSync(cssPath, "utf-8");

  return { html: Handlebars.compile(html), css };
};

// Apply config CSS variables to stylesheet
const applyConfigToCSS = (css, config) => {
  let modifiedCSS = css;
  const { colors = {}, typography = {} } = config;

  Object.entries({ ...colors, ...typography }).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
    modifiedCSS = modifiedCSS.replace(
      new RegExp(`${cssVar}:[^;]+;`, "g"),
      `${cssVar}: ${value};`,
    );
  });

  return modifiedCSS;
};

// Generate single PDF buffer from HTML
const generatePdfBuffer = async (browser, htmlContent) => {
  let page;
  try {
    page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load", timeout: 30000 });
    const pdfData = await page.pdf({ format: "A6", printBackground: true });
    // Puppeteer v24+ returns Uint8Array, convert to Buffer for Node.js compatibility
    return Buffer.from(pdfData);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Page might already be closed
      }
    }
  }
};

// Upload file and create DB entry
const uploadAndCreateFileEntry = async (
  buffer,
  name,
  extension,
  contentType,
  createdBy,
) => {
  const fileId = crypto.randomUUID();
  const key = `${fileId}.${extension}`;

  await uploadFile({ buffer, key, contentType });

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

  return file.id;
};

export const generateFiles = async (data, config, template, createdBy) => {
  const { html: templateFn, css } = loadTemplate(template);
  const styledCSS = applyConfigToCSS(css, config.config);
  const browser = await browserPool.acquire();

  try {
    const pdfBuffers = await generateAllPdfBuffers(
      browser,
      data,
      templateFn,
      styledCSS,
    );
    const studentFileMap = await uploadAllPdfs(pdfBuffers, createdBy);
    const zipFileId = await createAndUploadZip(
      data[0].class,
      pdfBuffers,
      createdBy,
    );

    return { studentFileMap, zipFileId };
  } finally {
    browserPool.release(browser);
  }
};

// Generate PDF buffers for all students in parallel
const generateAllPdfBuffers = async (browser, data, templateFn, css) => {
  const generateTasks = data.map(async (student) => {
    const html = templateFn(student);
    // Replace external CSS link with inline styles
    const fullHtml = html.replace(
      '<link rel="stylesheet" href="styles.css">',
      `<style>${css}</style>`,
    );
    const buffer = await generatePdfBuffer(browser, fullHtml);
    return { student, buffer };
  });

  return Promise.all(generateTasks);
};

// Upload all PDFs and return student-to-file mapping
const uploadAllPdfs = async (pdfBuffers, createdBy) => {
  const uploadTasks = pdfBuffers.map(async ({ student, buffer }) => {
    const fileId = await uploadAndCreateFileEntry(
      buffer,
      `${student.student.studentProfile.rollNumber}-${student.student.firstName.toLowerCase()}-${student.student.lastName.toLowerCase()}-id-card.pdf`,
      "pdf",
      "application/pdf",
      createdBy,
    );
    return { studentId: student.student.id, fileId };
  });

  const results = await Promise.all(uploadTasks);
  return Object.fromEntries(
    results.map(({ studentId, fileId }) => [studentId, fileId]),
  );
};

// Create zip file from all PDFs and upload
const createAndUploadZip = async (cls, pdfBuffers, createdBy) => {
  // const cls = pdfBuffers[0]?.class;
  logger.info({ cls }, `Creating zip file for class`);
  const zipBuffer = await createZipBuffer(pdfBuffers);
  return uploadAndCreateFileEntry(
    zipBuffer,
    `${cls.grade}-${cls.division}-id-cards`,
    "zip",
    "application/zip",
    createdBy,
  );
};

// Create zip buffer from PDF buffers
const createZipBuffer = (pdfBuffers) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("data", (chunk) => chunks.push(chunk));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);

    pdfBuffers.forEach(({ student, buffer }) =>
      archive.append(buffer, {
        name: `${student.student.studentProfile.rollNumber}-${student.student.firstName.toLowerCase()}-${student.student.lastName.toLowerCase()}-id-card.pdf`,
      }),
    );
    archive.finalize();
  });
};

// Fetch templates with optional type filter
const getTemplates = async (type) => {
  const where = type ? { type } : {};
  return prisma.template.findMany({ where, orderBy: { title: "asc" } });
};

// Fetch templates with by id
const getTemplateById = async (templateId) => {
  return prisma.template.findUnique({ where: { id: templateId } });
};

// Extract default values from JSON schema recursively
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

// Get default values for a template by ID
const getTemplateDefaults = async (templateId) => {
  // Get template from database
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  // Load schema.json from template directory
  const schemaPath = path.join(
    TEMPLATES_BASE_DIR,
    template.path,
    "schema.json",
  );

  try {
    const schemaContent = await fsPromises.readFile(schemaPath, "utf-8");
    const schema = JSON.parse(schemaContent);
    return extractDefaultsFromSchema(schema);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
};

const PATH_TO_TYPE = {
  "id-cards": "ID_CARD",
  "receipts/fee": "FEE_RECEIPT",
};

const syncTemplatesFromDisk = async () => {
  try {
    const existingTemplates = await prisma.template.findMany({
      select: { path: true },
    });
    const existingPaths = new Set(existingTemplates.map((t) => t.path));

    const created = [];
    for (const [dirPrefix, templateType] of Object.entries(PATH_TO_TYPE)) {
      const baseDir = path.join(TEMPLATES_BASE_DIR, dirPrefix);
      if (!fs.existsSync(baseDir)) continue;

      const entries = fs.readdirSync(baseDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const templatePath = `${dirPrefix}/${entry.name}`;
        if (existingPaths.has(templatePath)) continue;

        const htmlPath = path.join(baseDir, entry.name, "template.html");
        if (!fs.existsSync(htmlPath)) continue;

        let title = `${templateType.replace(/_/g, " ")} Template ${entry.name}`;
        const metaPath = path.join(baseDir, entry.name, "metadata.json");
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
            if (meta.title) title = meta.title;
          } catch { /* use default title */ }
        }

        await prisma.template.create({
          data: { type: templateType, path: templatePath, title },
        });
        created.push(templatePath);
      }
    }

    if (created.length > 0) {
      logger.info({ count: created.length, paths: created }, "Auto-synced templates from disk");
    }
  } catch (error) {
    logger.warn({ error: error.message }, "Failed to sync templates from disk");
  }
};

const templateService = {
  generateFiles,
  loadTemplate,
  getTemplates,
  getTemplateDefaults,
  getTemplateById,
  syncTemplatesFromDisk,
};

export default templateService;
