import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import paginateUtil from "../utils/paginate.util.js";
import { buildReceiptHtmlDocument } from "../billing/billing.receipt-html.js";
import {
  createReceiptFromRequest,
  getReceiptByIdForApi,
  getReceiptForGenerate,
  listReceiptsForApi,
  softDeleteReceiptById,
  updateReceiptFromRequest,
} from "../billing/billing.receipt.service.js";
import {
  renderBillingHtmlToPdfBuffer,
  safeBillingFilenamePart,
} from "../billing/billing-html-to-pdf.service.js";
import logger from "../config/logger.js";

const router = Router();

router.post("/", withPermission(Permission.CREATE_RECEIPT), async (req, res) => {
  const result = await createReceiptFromRequest(
    req.body.request,
    req.context.user.id,
  );
  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }
  return res.status(201).json({
    message: result.linkedInvoice
      ? "Receipt created and invoice marked paid."
      : "Receipt created!",
    data: result.data,
  });
});

router.get("/", withPermission(Permission.GET_RECEIPTS), async (req, res) => {
  const { schoolId, vendorId, status } = req.query;

  const where = {
    deletedAt: null,
    ...(schoolId && { schoolId }),
    ...(vendorId && { vendorId }),
    ...(status && { status }),
  };

  const receipts = await listReceiptsForApi(
    where,
    paginateUtil.getPaginationParams(req),
  );

  return res.json({
    message: "Receipts fetched!",
    data: receipts,
  });
});

router.get("/:id/pdf", withPermission(Permission.GET_RECEIPTS), async (req, res) => {
  const { id } = req.params;
  const notes =
    typeof req.query.notes === "string" ? req.query.notes : undefined;

  let receipt;
  try {
    receipt = await getReceiptForGenerate(id);
  } catch (e) {
    if (e?.code === "P2025") {
      return res.status(404).json({ message: "Receipt not found" });
    }
    throw e;
  }

  const { html } = buildReceiptHtmlDocument(receipt, notes);
  let pdfBuffer;
  try {
    pdfBuffer = await renderBillingHtmlToPdfBuffer(html);
  } catch (err) {
    logger.error({ err }, "Receipt PDF generation failed");
    return res.status(503).json({
      message:
        "PDF generation failed. Ensure headless Chrome (Puppeteer) is available on the server.",
    });
  }

  const label = safeBillingFilenamePart(
    receipt.receiptNumber || `receipt-${id.slice(0, 8)}`,
  );
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${label}.pdf"`);
  return res.send(pdfBuffer);
});

router.get("/:id", withPermission(Permission.GET_RECEIPTS), async (req, res) => {
  const receipt = await getReceiptByIdForApi(req.params.id);
  return res.json({
    message: "Receipt fetched!",
    data: receipt,
  });
});

router.patch("/:id", withPermission(Permission.UPDATE_RECEIPT), async (req, res) => {
  const result = await updateReceiptFromRequest(
    req.params.id,
    req.body.request,
    req.context.user.id,
  );
  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }
  return res.json({
    message: "Receipt updated!",
    data: result.data,
  });
});

router.delete("/:id", withPermission(Permission.DELETE_RECEIPT), async (req, res) => {
  await softDeleteReceiptById(req.params.id, req.context.user.id);
  return res.json({
    message: "Receipt deleted!",
  });
});

router.post("/:id/generate", withPermission(Permission.GET_RECEIPTS), async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body || {};

  const receipt = await getReceiptForGenerate(id);
  const { html, printUrl, receipt: full } = buildReceiptHtmlDocument(
    receipt,
    notes,
  );

  return res.json({
    message: "Receipt generated successfully!",
    data: {
      html,
      printUrl,
      receipt: full,
    },
  });
});

export default router;
