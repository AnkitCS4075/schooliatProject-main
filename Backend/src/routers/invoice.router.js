import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import paginateUtil from "../utils/paginate.util.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import deleteInvoiceSchema from "../schemas/invoice/delete-invoice.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import { buildInvoiceHtmlDocument } from "../billing/billing.invoice-html.js";
import {
  createInvoiceFromRequest,
  getInvoiceByIdForApi,
  getInvoiceForGenerate,
  listInvoicesForApi,
} from "../billing/billing.invoice.service.js";
import {
  renderBillingHtmlToPdfBuffer,
  safeBillingFilenamePart,
} from "../billing/billing-html-to-pdf.service.js";
import logger from "../config/logger.js";

const router = Router();

router.post("/", withPermission(Permission.CREATE_INVOICE), async (req, res) => {
  const result = await createInvoiceFromRequest(
    req.body.request,
    req.context.user.id,
  );
  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }
  return res.status(201).json({
    message: "Invoice created!",
    data: result.data,
  });
});

router.get("/", withPermission(Permission.GET_INVOICES), async (req, res) => {
  const { schoolId, vendorId, status } = req.query;

  const where = {
    deletedAt: null,
    ...(schoolId && { schoolId }),
    ...(vendorId && { vendorId }),
    ...(status && { status }),
  };

  const invoices = await listInvoicesForApi(
    where,
    paginateUtil.getPaginationParams(req),
  );

  return res.json({
    message: "Invoices fetched!",
    data: invoices,
  });
});

// PDF download — must be registered before GET /:id so "pdf" is not captured as :id
router.get("/:id/pdf", withPermission(Permission.GET_INVOICES), async (req, res) => {
  const { id } = req.params;
  const notes =
    typeof req.query.notes === "string" ? req.query.notes : undefined;

  let invoice;
  try {
    invoice = await getInvoiceForGenerate(id);
  } catch (e) {
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Invoice not found" });
    }
    throw e;
  }

  const { html } = buildInvoiceHtmlDocument(invoice, notes);
  let pdfBuffer;
  try {
    pdfBuffer = await renderBillingHtmlToPdfBuffer(html);
  } catch (err) {
    logger.error({ err }, "Invoice PDF generation failed");
    return res.status(503).json({
      message:
        "PDF generation failed. Ensure headless Chrome (Puppeteer) is available on the server.",
    });
  }

  const label = safeBillingFilenamePart(
    invoice.invoiceNumber || `invoice-${id.slice(0, 8)}`,
  );
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${label}.pdf"`);
  return res.send(pdfBuffer);
});

router.get("/:id", withPermission(Permission.GET_INVOICES), async (req, res) => {
  const invoice = await getInvoiceByIdForApi(req.params.id);
  return res.json({ data: invoice });
});

router.patch("/:id", withPermission(Permission.UPDATE_INVOICE), async (req, res) => {
  const request = req.body.request;
  const currentUser = req.context.user;

  const updatedInvoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      ...request,
      updatedBy: currentUser.id,
    },
  });

  return res.json({
    message: "Invoice updated!",
    data: updatedInvoice,
  });
});

router.delete(
  "/:id",
  withPermission(Permission.DELETE_INVOICE),
  validateRequest(deleteInvoiceSchema),
  requireDeletionOTP({ entityType: "Invoice" }),
  async (req, res) => {
    const currentUser = req.context.user;

    await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Invoice deleted!" });
  },
);

router.post("/:id/generate", withPermission(Permission.GET_INVOICES), async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body || {};

  const invoice = await getInvoiceForGenerate(id);
  const { html, printUrl } = buildInvoiceHtmlDocument(invoice, notes);

  return res.json({
    message: "Invoice generated successfully!",
    data: {
      html,
      printUrl,
    },
  });
});

export default router;
