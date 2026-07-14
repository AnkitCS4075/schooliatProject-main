import { Router } from "express";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import prisma from "../prisma/client.js";

const router = Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LETTERHEAD_DEFAULTS = Object.freeze({
  companyName: "Schooliat Technologies Private Limited",
  companyTagline: "One School, One Vendor",
  companyAddress: "www.schooliat.com",
  companyPhone: "+91 8551919628",
  companyEmail: "info@schooliat.com",
  logoUrl: "https://schooliat.com/_next/static/media/logo.b01f5b08.png",
  themeColor: "#0f172a",
  themeColorDark: "#1e293b",
});

let letterheadHistoryTableEnsured = false;

const ensureLetterheadHistoryTable = async () => {
  if (letterheadHistoryTableEnsured) return;

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS letterhead_history (
        id TEXT PRIMARY KEY,
        school_id TEXT NULL,
        created_by TEXT NOT NULL,
        created_by_name TEXT NULL,
        subject TEXT NULL,
        date_value DATE NULL,
        content TEXT NOT NULL,
        content_format TEXT NULL,
        signature_name TEXT NULL,
        signature_designation TEXT NULL,
        generated_html TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS letterhead_history_created_at_idx ON letterhead_history (created_at DESC)`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS letterhead_history_school_id_idx ON letterhead_history (school_id)`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS letterhead_history_created_by_idx ON letterhead_history (created_by)`,
    );

    letterheadHistoryTableEnsured = true;
  } catch (error) {
    console.error("Error ensuring letterhead_history table:", error);
    letterheadHistoryTableEnsured = true;
  }
};

// Load letterhead template
const getLetterheadTemplate = () => {
  const templatePath = join(__dirname, "../templates/letterhead.html");
  return readFileSync(templatePath, "utf-8");
};

router.get(
  "/",
  withPermission(Permission.CREATE_RECEIPT),
  async (req, res) => {
    try {
      const template = getLetterheadTemplate();
      return res.json({
        message: "Letterhead template fetched!",
        data: {
          template,
          endpoint: "/letterhead/generate",
          description: "POST to /letterhead/generate to generate a letterhead with content",
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to load letterhead template",
        message: error.message,
      });
    }
  },
);

router.post(
  "/generate",
  withPermission(Permission.CREATE_RECEIPT), // Using existing permission for now
  async (req, res) => {
    const request = req.body.request;

    if (!request.content || !request.content.trim()) {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    // Escape HTML to prevent XSS
    const escapeHtml = (text) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    };

    const sanitizeRichTextHtml = (html) => {
      let safe = String(html || "");

      // Remove dangerous blocks and inline handlers.
      safe = safe.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
      safe = safe.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, "");
      safe = safe.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, "");
      safe = safe.replace(/javascript:/gi, "");

      // Strip unsupported tags and attributes.
      safe = safe.replace(
        /<(?!\/?(strong|em|u|b|i|br|p|div|ul|ol|li|table|thead|tbody|tr|th|td|span)\b)[^>]*>/gi,
        "",
      );

      const sanitizeStyleAttribute = (styleValue = "") => {
        const allowedStyleProps = new Set([
          "text-align",
          "border",
          "border-collapse",
          "padding",
          "width",
          "margin",
          "font-size",
          "font-family",
        ]);
        return String(styleValue)
          .split(";")
          .map((rule) => rule.trim())
          .filter(Boolean)
          .map((rule) => {
            const [prop, ...rest] = rule.split(":");
            if (!prop || rest.length === 0) return null;
            const key = prop.trim().toLowerCase();
            const value = rest.join(":").trim();
            if (!allowedStyleProps.has(key)) return null;
            if (value.toLowerCase().includes("javascript:")) return null;
            return `${key}: ${value}`;
          })
          .filter(Boolean)
          .join("; ");
      };

      const sanitizeTagAttributes = (tag, attrs = "") => {
        const textAlignMatch = attrs.match(/text-align\s*:\s*(left|right|center|justify)/i);
        const styleMatch = attrs.match(/style\s*=\s*(["'])(.*?)\1/i);
        const styleValue = styleMatch ? sanitizeStyleAttribute(styleMatch[2]) : "";

        const allowedAttrs = [];
        
        // Allow text-align on block elements
        if (["p", "div", "th", "td"].includes(tag) && textAlignMatch) {
          allowedAttrs.push(`style="text-align: ${textAlignMatch[1].toLowerCase()}"`);
        }

        // Allow styles on inline and table elements
        if (["span", "strong", "em", "u", "b", "i", "table", "th", "td"].includes(tag) && styleValue) {
          allowedAttrs.push(`style="${styleValue}"`);
        }

        if (["th", "td"].includes(tag)) {
          const colspanMatch = attrs.match(/colspan\s*=\s*(["']?)(\d+)\1/i);
          const rowspanMatch = attrs.match(/rowspan\s*=\s*(["']?)(\d+)\1/i);
          if (colspanMatch) {
            allowedAttrs.push(`colspan="${colspanMatch[2]}"`);
          }
          if (rowspanMatch) {
            allowedAttrs.push(`rowspan="${rowspanMatch[2]}"`);
          }
        }

        return allowedAttrs.length > 0 ? ` ${allowedAttrs.join(" ")}` : "";
      };

      safe = safe.replace(
        /<(\/?)(strong|em|u|b|i|br|p|div|ul|ol|li|table|thead|tbody|tr|th|td|span)([^>]*)>/gi,
        (_, slash, tag, attrs) => {
          const normalizedTag = String(tag).toLowerCase();
          if (slash) {
            return `</${normalizedTag}>`;
          }
          const sanitizedAttrs = sanitizeTagAttributes(normalizedTag, attrs);
          return `<${normalizedTag}${sanitizedAttrs}>`;
        },
      );

      // Normalize aliases and block-level tags for template body.
      safe = safe.replace(/<\/?b>/gi, (match) => (match.startsWith("</") ? "</strong>" : "<strong>"));
      safe = safe.replace(/<\/?i>/gi, (match) => (match.startsWith("</") ? "</em>" : "<em>"));
      safe = safe.replace(/<\/?(p|div)>/gi, "<br>");
      safe = safe.replace(/(?:<br>\s*){3,}/gi, "<br><br>");
      safe = safe.replace(/^(<br>)+|(<br>)+$/gi, "");

      return safe;
    };

    // Process formatting markers and convert to HTML
    const processFormatting = (text, format = "plain") => {
      if (format === "html") {
        return sanitizeRichTextHtml(text);
      }

      // First escape HTML
      let processed = escapeHtml(text);

      // Convert formatting markers to HTML
      // Use a placeholder approach to avoid conflicts
      // Step 1: Replace bold markers with placeholder
      processed = processed.replace(
        /\*\*([^*]+?)\*\*/g,
        "~~BOLD_START~~$1~~BOLD_END~~",
      );
      // Step 2: Replace underline markers
      processed = processed.replace(
        /__([^_]+?)__/g,
        "~~UNDERLINE_START~~$1~~UNDERLINE_END~~",
      );
      // Step 3: Replace italic markers (single asterisks)
      processed = processed.replace(
        /\*([^*\n]+?)\*/g,
        "~~ITALIC_START~~$1~~ITALIC_END~~",
      );

      // Step 4: Convert placeholders to HTML
      processed = processed.replace(/~~BOLD_START~~/g, "<strong>");
      processed = processed.replace(/~~BOLD_END~~/g, "</strong>");
      processed = processed.replace(/~~UNDERLINE_START~~/g, "<u>");
      processed = processed.replace(/~~UNDERLINE_END~~/g, "</u>");
      processed = processed.replace(/~~ITALIC_START~~/g, "<em>");
      processed = processed.replace(/~~ITALIC_END~~/g, "</em>");

      // Convert newlines to <br>
      processed = processed.replace(/\n/g, "<br>");

      return processed;
    };

    const formattedContent = processFormatting(request.content, request.contentFormat);
    const escapedSubject = request.subject ? escapeHtml(request.subject) : null;
    const escapedSignatureName = request.signatureName
      ? escapeHtml(request.signatureName)
      : null;
    const escapedSignatureDesignation = request.signatureDesignation
      ? escapeHtml(request.signatureDesignation)
      : null;

    // Use provided date or default to current date
    let dateToUse;
    if (request.date) {
      // Handle YYYY-MM-DD format (from frontend) or ISO string
      if (
        typeof request.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(request.date)
      ) {
        // Parse YYYY-MM-DD as local date to avoid timezone issues
        const [year, month, day] = request.date.split("-").map(Number);
        dateToUse = new Date(year, month - 1, day);
      } else {
        dateToUse = new Date(request.date);
      }
      // Validate date
      if (isNaN(dateToUse.getTime())) {
        return res.status(400).json({
          error: "Invalid date format",
        });
      }
    } else {
      dateToUse = new Date();
    }

    const formattedDate = dateToUse.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const companyName = request.companyName?.trim() || LETTERHEAD_DEFAULTS.companyName;
    const companyTagline = request.companyTagline?.trim() || LETTERHEAD_DEFAULTS.companyTagline;
    const companyAddress = request.companyAddress?.trim() || LETTERHEAD_DEFAULTS.companyAddress;
    const companyPhone = request.companyPhone?.trim() || LETTERHEAD_DEFAULTS.companyPhone;
    const companyEmail = request.companyEmail?.trim() || LETTERHEAD_DEFAULTS.companyEmail;
    const themeColor = request.themeColor?.trim() || LETTERHEAD_DEFAULTS.themeColor;
    const themeColorDark = request.themeColorDark?.trim() || LETTERHEAD_DEFAULTS.themeColorDark;
    const hideLogo = request.hideLogo === true;
    let logoHtml = "";
    if (!hideLogo) {
      const logoUrl = request.logoUrl?.trim() || LETTERHEAD_DEFAULTS.logoUrl;
      logoHtml = `<img class="logo" src="${escapeHtml(logoUrl)}" alt="Logo" />`;
    }

    // Load template and replace placeholders
    let letterheadHTML = getLetterheadTemplate();

    // Replace brand variables
    letterheadHTML = letterheadHTML.replace(/\{\{COMPANY_NAME\}\}/g, companyName);
    letterheadHTML = letterheadHTML.replace(/\{\{COMPANY_TAGLINE\}\}/g, `<p>${companyTagline}</p>`);
    letterheadHTML = letterheadHTML.replace(/\{\{COMPANY_ADDRESS\}\}/g, companyAddress);
    letterheadHTML = letterheadHTML.replace(/\{\{COMPANY_PHONE\}\}/g, companyPhone);
    letterheadHTML = letterheadHTML.replace(/\{\{COMPANY_EMAIL\}\}/g, companyEmail);
    letterheadHTML = letterheadHTML.replace(/\{\{THEME_COLOR\}\}/g, themeColor);
    letterheadHTML = letterheadHTML.replace(/\{\{THEME_COLOR_DARK\}\}/g, themeColorDark);
    letterheadHTML = letterheadHTML.replace(/\{\{LOGO_HTML\}\}/g, logoHtml);

    // Replace template variables
    letterheadHTML = letterheadHTML.replace("{{DATE}}", formattedDate);

    // Replace subject section
    const subjectSection = escapedSubject
      ? `<div class="subject-box"><strong>Subject:</strong> ${escapedSubject}</div>`
      : "";
    letterheadHTML = letterheadHTML.replace(
      "{{SUBJECT_SECTION}}",
      subjectSection,
    );

    // Replace content
    letterheadHTML = letterheadHTML.replace("{{CONTENT}}", formattedContent);

    // Replace signature section
    const signatureSection =
      escapedSignatureName || escapedSignatureDesignation
        ? `
    <div class="signature-wrapper">
        <div class="signature-line"></div>
        ${escapedSignatureName ? `<div class="signature-name">${escapedSignatureName}</div>` : ""}
      ${escapedSignatureDesignation ? `<div class="signature-title">${escapedSignatureDesignation}</div>` : ""}
    </div>
    `
        : "";
    letterheadHTML = letterheadHTML.replace(
      "{{SIGNATURE_SECTION}}",
      signatureSection,
    );

    // Trim the result
    letterheadHTML = letterheadHTML.trim();

    try {
      await ensureLetterheadHistoryTable();

      const user = req?.context?.user;
      const createdByName = [user?.firstName, user?.lastName]
        .map((v) => String(v || "").trim())
        .filter(Boolean)
        .join(" ");

      const dateValue =
        request.date && /^\d{4}-\d{2}-\d{2}$/.test(String(request.date))
          ? request.date
          : dateToUse.toISOString().split("T")[0];

      const historyId = randomUUID();

      await prisma.$queryRaw`
        INSERT INTO letterhead_history (
          id,
          school_id,
          created_by,
          created_by_name,
          subject,
          date_value,
          content,
          content_format,
          signature_name,
          signature_designation,
          generated_html
        )
        VALUES (
          ${historyId},
          ${user?.schoolId || null},
          ${user?.id || "unknown"},
          ${createdByName || null},
          ${request.subject ? String(request.subject).trim() : null},
          ${dateValue},
          ${String(request.content || "")},
          ${request.contentFormat ? String(request.contentFormat) : "plain"},
          ${request.signatureName ? String(request.signatureName).trim() : null},
          ${request.signatureDesignation
            ? String(request.signatureDesignation).trim()
            : null},
          ${letterheadHTML}
        )
      `;

      // Return the HTML as a data URL or base64 encoded
    // For simplicity, we'll return it as a response that the frontend can handle
      const base64HTML = Buffer.from(letterheadHTML).toString("base64");
      const dataUrl = `data:text/html;base64,${base64HTML}`;

      return res.json({
        message: "Letterhead generated successfully!",
        data: {
          id: historyId,
          html: letterheadHTML,
          printUrl: dataUrl,
        },
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to save letterhead history",
        message: error.message,
      });
    }
  },
);

router.get(
  "/history",
  withPermission(Permission.CREATE_RECEIPT),
  async (req, res) => {
    try {
      await ensureLetterheadHistoryTable();

      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
      const search = String(req.query.search || "").trim();
      const schoolId = req?.context?.user?.schoolId || null;

      const params = [];
      const whereClauses = ["1=1"];

      if (schoolId) {
        params.push(schoolId);
        whereClauses.push(`school_id = $${params.length}`);
      }

      if (search) {
        params.push(`%${search}%`);
        const idx = params.length;
        whereClauses.push(`(COALESCE(subject, '') ILIKE $${idx} OR COALESCE(created_by_name, '') ILIKE $${idx} OR COALESCE(content, '') ILIKE $${idx})`);
      }

      const whereSql = whereClauses.join(" AND ");
      const offset = (page - 1) * limit;

      // Add limit and offset as parameters
      params.push(limit);
      const limitIdx = params.length;
      params.push(offset);
      const offsetIdx = params.length;

      const countRows = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int AS total FROM letterhead_history WHERE ${whereSql}`,
        ...params.slice(0, -2),
      );
      const total = Number(countRows?.[0]?.total || 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const items = await prisma.$queryRawUnsafe(
        `
          SELECT
            id,
            subject,
            date_value,
            created_by,
            created_by_name,
            signature_name,
            signature_designation,
            generated_html,
            created_at
          FROM letterhead_history
          WHERE ${whereSql}
          ORDER BY created_at DESC
          LIMIT $${limitIdx}
          OFFSET $${offsetIdx}
        `,
        ...params,
      );

      return res.json({
        message: "Letterhead history fetched successfully!",
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Letterhead history error:", error);
      return res.status(500).json({
        error: "Failed to fetch letterhead history",
        message: error.message,
      });
    }
  },
);

router.get(
  "/history/:id",
  withPermission(Permission.CREATE_RECEIPT),
  async (req, res) => {
    try {
      await ensureLetterheadHistoryTable();

      const schoolId = req?.context?.user?.schoolId || null;
      const id = req.params.id;

      const rows = schoolId
        ? await prisma.$queryRaw`
            SELECT
              id,
              subject,
              date_value,
              created_by,
              created_by_name,
              content,
              content_format,
              signature_name,
              signature_designation,
              generated_html,
              created_at
            FROM letterhead_history
            WHERE id = ${id} AND school_id = ${schoolId}
            LIMIT 1
          `
        : await prisma.$queryRaw`
            SELECT
              id,
              subject,
              date_value,
              created_by,
              created_by_name,
              content,
              content_format,
              signature_name,
              signature_designation,
              generated_html,
              created_at
            FROM letterhead_history
            WHERE id = ${id}
            LIMIT 1
          `;

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Letterhead history not found" });
      }

      return res.json({
        message: "Letterhead history fetched successfully!",
        data: rows[0],
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch letterhead history",
        message: error.message,
      });
    }
  },
);

export default router;
