import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import crypto from "crypto";
import prisma from "../prisma/client.js";
import { uploadFile } from "../config/storage/index.js";
import browserPool from "../utils/browser-pool.util.js";
import logger from "../config/logger.js";
import { TemplateType } from "../prisma/generated/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_BASE_DIR = path.join(__dirname, "../templates");

// Mapping of template types to their directory paths
const TEMPLATE_TYPE_TO_DIR = {
  [TemplateType.ID_CARD]: "id-cards",
  [TemplateType.RESULT]: "results",
  [TemplateType.INVENTORY_RECEIPT]: "receipts/inventory",
  [TemplateType.FEE_RECEIPT]: "receipts/fee",
};

// Sample data for ID card template preview generation
const ID_CARD_SAMPLE_DATA = {
  student: {
    id: "sample-student-id",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("2010-05-15"),
    idPhotoId: null,
    studentProfile: {
      rollNumber: "2024001",
      bloodGroup: "O_POSITIVE",
      fatherContact: "+91 98765 43210",
      motherContact: "+91 98765 43211",
      class: { grade: "10", division: "A" },
    },
  },
  school: {
    name: "Sample Public School",
    address: ["123 Education Street", "Knowledge City, 560001"],
    phone: "+91 80 1234 5678",
    logoId: null,
  },
  studentId: "sample-student-id",
  studentName: "John Doe",
  studentPhoto: null,
  rollNumber: "2024001",
  className: "10 - A",
  bloodGroup: "O+",
  dateOfBirth: "15/05/2010",
  fatherContact: "+91 98765 43210",
  motherContact: "+91 98765 43211",
  schoolName: "Sample Public School",
  schoolAddress: "123 Education Street, Knowledge City, 560001",
  schoolPhone: "+91 80 1234 5678",
  schoolLogo: null,
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

// Load template files (metadata, schema, html, css)
const loadTemplateFiles = (templateDir) => {
  const metadataPath = path.join(templateDir, "metadata.json");
  const schemaPath = path.join(templateDir, "schema.json");
  const htmlPath = path.join(templateDir, "template.html");
  const cssPath = path.join(templateDir, "styles.css");

  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
  const html = fs.readFileSync(htmlPath, "utf-8");
  const css = fs.readFileSync(cssPath, "utf-8");

  return { metadata, schema, html, css };
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

// Generate PDF buffer from HTML
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

// Generate image buffer from HTML
const generateImageBuffer = async (browser, htmlContent) => {
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 400, height: 600, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: "load", timeout: 30000 });
    const imageData = await page.screenshot({ type: "png", fullPage: true });
    // Puppeteer v24+ returns Uint8Array, convert to Buffer for Node.js compatibility
    return Buffer.from(imageData);
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
) => {
  const fileId = crypto.randomUUID();
  const key = `${fileId}.${extension}`;

  await uploadFile({ buffer, key, contentType });

  await prisma.file.create({
    data: {
      id: fileId,
      name,
      extension,
      contentType,
      size: buffer.length,
      createdBy: "system",
    },
  });

  return fileId;
};

// Get sample data based on template type
const getSampleData = (templateType) => {
  if (templateType === TemplateType.ID_CARD) return ID_CARD_SAMPLE_DATA;
  return {};
};

// Generate sample PDF buffer from template with custom config
// This function can be used to generate samples with custom configurations
// browser: optional browser instance (if not provided, will acquire and release one)
const generateSamplePdf = async (
  templatePath,
  config,
  sampleData = null,
  browser = null,
) => {
  const templateDir = path.join(TEMPLATES_BASE_DIR, templatePath);
  const { schema, html, css } = loadTemplateFiles(templateDir);

  // Use provided sample data or get default based on template type
  const finalSampleData = sampleData || ID_CARD_SAMPLE_DATA;

  // Merge config with schema defaults if config is empty or partial
  const defaultConfig = extractDefaultsFromSchema(schema);
  const mergedConfig = { ...defaultConfig, ...config };

  // Compile template with sample data and config
  const template = Handlebars.compile(html);
  const styledCSS = applyConfigToCSS(css, mergedConfig);
  const renderedHtml = template({ ...finalSampleData, config: mergedConfig });
  const fullHtml = renderedHtml.replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>${styledCSS}</style>`,
  );

  // Generate PDF buffer
  const shouldReleaseBrowser = !browser;
  if (!browser) {
    browser = await browserPool.acquire();
  }

  try {
    const pdfBuffer = await generatePdfBuffer(browser, fullHtml);
    return pdfBuffer;
  } finally {
    if (shouldReleaseBrowser) {
      browserPool.release(browser);
    }
  }
};

// Load templates from a specific folder and type
const loadTemplatesOfType = async (
  folderName,
  templateType,
  existingTemplates,
) => {
  const templatesDir = path.join(TEMPLATES_BASE_DIR, folderName);
  if (!fs.existsSync(templatesDir)) return [];

  const templateFolders = fs.readdirSync(templatesDir).filter((f) => {
    const fullPath = path.join(templatesDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  const browser = await browserPool.acquire();
  const loadedTemplates = [];

  try {
    for (const folder of templateFolders) {
      const templatePath = `${folderName}/${folder}`;
      const existingKey = `${templateType}:${templatePath}`;

      if (existingTemplates.has(existingKey)) {
        logger.debug(`Template already exists: ${templatePath}`);
        continue;
      }

      try {
        const templateDir = path.join(templatesDir, folder);
        const { metadata, schema } = loadTemplateFiles(templateDir);
        const defaultConfig = extractDefaultsFromSchema(schema);
        const sampleData = getSampleData(templateType);

        // Use the extracted function to generate sample PDF (pass browser to reuse it)
        const pdfBuffer = await generateSamplePdf(
          templatePath,
          defaultConfig,
          sampleData,
          browser,
        );

        // Generate image buffer (still need browser for this)
        const { html, css } = loadTemplateFiles(templateDir);
        const template = Handlebars.compile(html);
        const styledCSS = applyConfigToCSS(css, defaultConfig);
        const renderedHtml = template({ ...sampleData, config: defaultConfig });
        const fullHtml = renderedHtml.replace(
          '<link rel="stylesheet" href="styles.css">',
          `<style>${styledCSS}</style>`,
        );
        const imageBuffer = await generateImageBuffer(browser, fullHtml);

        // Upload files
        const [sampleId, imageId] = await Promise.all([
          uploadAndCreateFileEntry(
            pdfBuffer,
            `${metadata.title}_sample`,
            "pdf",
            "application/pdf",
          ),
          uploadAndCreateFileEntry(
            imageBuffer,
            `${metadata.title}_preview`,
            "png",
            "image/png",
          ),
        ]);

        // Create template entry
        const dbTemplate = await prisma.template.create({
          data: {
            type: templateType,
            path: templatePath,
            title: metadata.title,
            sampleId,
            imageId,
          },
        });

        loadedTemplates.push(dbTemplate);
        logger.info(`Loaded template: ${templatePath}`);
      } catch (err) {
        logger.error(`Failed to load template ${templatePath}: ${err.message}`);
      }
    }
  } finally {
    browserPool.release(browser);
  }

  return loadedTemplates;
};

// Main function to load all templates at startup
// This function is safe to call even if Puppeteer/Chrome is not available
const loadAllTemplates = async () => {
  logger.info("Loading templates...");

  try {
    // Check if browser pool can be initialized (Puppeteer available)
    // This will fail gracefully if Chrome is not installed
    await browserPool.initialize();
  } catch (error) {
    logger.warn(
      { error: error.message },
      "Puppeteer/Chrome not available. Template preview generation will be skipped. Templates will still be available for use.",
    );
    logger.info(
      "Template metadata will be loaded, but sample PDFs and preview images will not be generated.",
    );
    // Continue without browser - templates can still be used, just without previews
    return;
  }

  try {
    // Fetch existing templates
    const existingTemplates = await prisma.template.findMany({
      select: { type: true, path: true },
    });
    const existingSet = new Set(
      existingTemplates.map((t) => `${t.type}:${t.path}`),
    );

    // Load all template types
    let totalLoaded = 0;
    for (const [templateType, folderPath] of Object.entries(
      TEMPLATE_TYPE_TO_DIR,
    )) {
      try {
        const loaded = await loadTemplatesOfType(
          folderPath,
          templateType,
          existingSet,
        );
        if (loaded.length > 0) {
          logger.info(`Loaded ${loaded.length} new ${templateType} template(s)`);
          totalLoaded += loaded.length;
        }
      } catch (error) {
        logger.error(
          { error: error.message, templateType, folderPath },
          `Failed to load templates of type ${templateType}`,
        );
        // Continue loading other template types
      }
    }

    logger.info(`Template loading complete. Total new templates: ${totalLoaded}`);
  } catch (error) {
    logger.error(
      { error: error.message },
      "Error during template loading. Templates may still be available if they were previously loaded.",
    );
    // Don't throw - server should continue even if template loading fails
  }
};

const templateLoaderService = {
  loadAllTemplates,
  TEMPLATE_TYPE_TO_DIR,
  generateSamplePdf,
  ID_CARD_SAMPLE_DATA,
};

export default templateLoaderService;
