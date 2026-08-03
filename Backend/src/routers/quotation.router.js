import { Router } from "express";
import { Permission } from "../prisma/generated/index.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import quotationService from "../services/quotation.service.js";
import { buildQuotationHtmlDocument, getSettingsForQuotation } from "../billing/billing.quotation-html.js";
import { renderBillingHtmlToPdfBuffer, safeBillingFilenamePart } from "../billing/billing-html-to-pdf.service.js";
import emailService from "../services/email.service.js";
import logger from "../config/logger.js";

const router = Router();

// Create quotation
router.post(
  "/quotations",
  withPermission(Permission.CREATE_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      // Super admin / platform user has no schoolId — require one in the request.
      const schoolId = currentUser.schoolId || req.body.request?.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "schoolId is required to create a quotation" });
      }
      const quotation = await quotationService.createQuotation({
        ...req.body.request,
        schoolId,
        createdBy: currentUser.id,
      });
      return res.status(201).json({ message: "Quotation created", data: quotation });
    } catch (error) {
      logger.error({ error }, "Failed to create quotation");
      return res.status(400).json({ message: error.message || "Failed to create quotation" });
    }
  },
);

// List quotations
router.get(
  "/quotations",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const result = await quotationService.getQuotations(currentUser.schoolId, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        status: req.query.status || undefined,
        search: req.query.search || undefined,
        sortBy: req.query.sortBy || undefined,
        sortOrder: req.query.sortOrder || undefined,
      });
      return res.status(200).json({ message: "Quotations retrieved", data: result.quotations, pagination: result.pagination });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch quotations" });
    }
  },
);

// Search quotations by number
router.get(
  "/quotations/search",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { q } = req.query;
      if (!q) return res.status(200).json({ message: "Query required", data: [] });

      const result = await quotationService.getQuotations(currentUser.schoolId, {
        search: q,
        limit: 10,
      });
      return res.status(200).json({ message: "Search results", data: result.quotations });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Search failed" });
    }
  },
);

// Quotation stats
router.get(
  "/quotations/stats",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const stats = await quotationService.getQuotationStats(currentUser.schoolId);
      return res.status(200).json({ message: "Stats retrieved", data: stats });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch stats" });
    }
  },
);

// Get quotation by ID
router.get(
  "/quotations/:id",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.getQuotationById(req.params.id, currentUser.schoolId);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });
      return res.status(200).json({ message: "Quotation retrieved", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch quotation" });
    }
  },
);

// Update quotation
router.patch(
  "/quotations/:id",
  withPermission(Permission.EDIT_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.updateQuotation(req.params.id, currentUser.schoolId, {
        ...req.body.request,
        updatedBy: currentUser.id,
      });
      return res.status(200).json({ message: "Quotation updated", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update quotation" });
    }
  },
);

// Delete quotation
router.delete(
  "/quotations/:id",
  withPermission(Permission.DELETE_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      await quotationService.deleteQuotation(req.params.id, currentUser.schoolId, currentUser.id);
      return res.status(200).json({ message: "Quotation deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to delete quotation" });
    }
  },
);

// Approve quotation
router.post(
  "/quotations/:id/approve",
  withPermission(Permission.APPROVE_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.approveQuotation(req.params.id, currentUser.schoolId, currentUser.id);
      return res.status(200).json({ message: "Quotation approved", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to approve quotation" });
    }
  },
);

// Reject quotation
router.patch(
  "/quotations/:id/reject",
  withPermission(Permission.EDIT_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.rejectQuotation(req.params.id, currentUser.schoolId, req.body.request?.reason);
      return res.status(200).json({ message: "Quotation rejected", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to reject quotation" });
    }
  },
);

// Cancel quotation
router.post(
  "/quotations/:id/cancel",
  withPermission(Permission.CANCEL_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.cancelQuotation(req.params.id, currentUser.schoolId, req.body.request?.comment, currentUser.id);
      return res.status(200).json({ message: "Quotation cancelled", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to cancel quotation" });
    }
  },
);

// Close quotation
router.post(
  "/quotations/:id/close",
  withPermission(Permission.EDIT_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.closeQuotation(req.params.id, currentUser.schoolId, req.body.request?.comment, currentUser.id);
      return res.status(200).json({ message: "Quotation closed", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to close quotation" });
    }
  },
);

// Convert to invoice
router.post(
  "/quotations/:id/convert-to-invoice",
  withPermission(Permission.CONVERT_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const result = await quotationService.convertToInvoice(req.params.id, currentUser.schoolId, currentUser.id);
      return res.status(200).json({ message: "Quotation converted to invoice", data: result });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to convert quotation" });
    }
  },
);

// PDF download
router.get(
  "/quotations/:id/pdf",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.getQuotationById(req.params.id, currentUser.schoolId);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });

      const settings = await getSettingsForQuotation(quotation.schoolId);
      const { html } = await buildQuotationHtmlDocument(quotation, settings);
      const pdfBuffer = await renderBillingHtmlToPdfBuffer(html);

      const filename = `${safeBillingFilenamePart(quotation.quotationNumber)}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } catch (error) {
      logger.error({ error }, "Failed to generate quotation PDF");
      return res.status(400).json({ message: error.message || "Failed to generate PDF" });
    }
  },
);

// HTML preview
router.get(
  "/quotations/:id/preview",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.getQuotationById(req.params.id, currentUser.schoolId);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });

      const settings = await getSettingsForQuotation(quotation.schoolId);
      const { html, printUrl } = await buildQuotationHtmlDocument(quotation, settings);
      return res.status(200).json({ message: "Preview generated", data: { html, printUrl } });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to generate preview" });
    }
  },
);

// Send via email
router.post(
  "/quotations/:id/send-email",
  withPermission(Permission.SEND_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.getQuotationById(req.params.id, currentUser.schoolId);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });

      const settings = await getSettingsForQuotation(quotation.schoolId);
      const { html } = await buildQuotationHtmlDocument(quotation, settings);
      const pdfBuffer = await renderBillingHtmlToPdfBuffer(html);

      const toEmail = req.body.request?.email || quotation.customerEmail;
      if (!toEmail) return res.status(400).json({ message: "No email address provided" });

      await emailService.sendEmail({
        to: toEmail,
        subject: `Quotation ${quotation.quotationNumber} from ${settings?.companyName || "SchooliAT"}`,
        html: `<p>Dear ${quotation.customerName},</p><p>Please find attached quotation <strong>${quotation.quotationNumber}</strong>.</p><p>Valid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "N/A"}</p><p>Thank you for your business.</p>`,
        attachments: [{
          filename: `${safeBillingFilenamePart(quotation.quotationNumber)}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        }],
      });

      // Update status to SENT if currently DRAFT
      if (quotation.status === "DRAFT") {
        await quotationService.updateQuotation(quotation.id, currentUser.schoolId, {
          updatedBy: currentUser.id,
          changeNote: "Sent via email",
        });
      }

      return res.status(200).json({ message: "Quotation sent via email" });
    } catch (error) {
      logger.error({ error }, "Failed to send quotation email");
      return res.status(400).json({ message: error.message || "Failed to send email" });
    }
  },
);

// Send via WhatsApp (generate link)
router.post(
  "/quotations/:id/send-whatsapp",
  withPermission(Permission.SEND_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await quotationService.getQuotationById(req.params.id, currentUser.schoolId);
      if (!quotation) return res.status(404).json({ message: "Quotation not found" });

      const phone = quotation.customerPhone?.replace(/[^0-9]/g, "") || req.body.request?.phone;
      if (!phone) return res.status(400).json({ message: "No phone number available" });

      const message = `Dear ${quotation.customerName},\n\nYour quotation ${quotation.quotationNumber} is ready.\nTotal: ₹${parseFloat(quotation.totalAmount).toLocaleString("en-IN")}\nValid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "N/A"}\n\nThank you for your business!`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      return res.status(200).json({ message: "WhatsApp link generated", data: { url: whatsappUrl } });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to generate WhatsApp link" });
    }
  },
);

// Version history
router.get(
  "/quotations/:id/versions",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const versions = await quotationService.getQuotationVersions(req.params.id);
      return res.status(200).json({ message: "Versions retrieved", data: versions });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch versions" });
    }
  },
);

// Add comment
router.post(
  "/quotations/:id/comments",
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const comment = await quotationService.addComment(
        req.params.id,
        currentUser.id,
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email,
        req.body.request?.content,
      );
      return res.status(201).json({ message: "Comment added", data: comment });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to add comment" });
    }
  },
);

export default router;
