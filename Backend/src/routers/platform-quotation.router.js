import { Router } from "express";
import { Permission, RoleName } from "../prisma/generated/index.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import platformQuotationService from "../services/platform-quotation.service.js";
import logger from "../config/logger.js";

const router = Router();

function requireSuperAdmin(req, res, next) {
  const roleName = req.context.user?.role?.name;
  if (roleName !== RoleName.SUPER_ADMIN) {
    return res.status(403).json({ message: "Only Super Admin can access platform quotations" });
  }
  next();
}

const guard = [requireSuperAdmin];

router.get(
  "/stats",
  ...guard,
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const stats = await platformQuotationService.stats();
      return res.status(200).json({ message: "Stats fetched", data: stats });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch stats" });
    }
  },
);

router.get(
  "/",
  ...guard,
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const { status, search, page, limit } = req.query;
      const result = await platformQuotationService.list(
        { status, search },
        { page, limit },
      );
      return res.status(200).json({ message: "Platform quotations fetched", data: result });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch platform quotations" });
    }
  },
);

router.get(
  "/:id",
  ...guard,
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const quotation = await platformQuotationService.getById(req.params.id);
      if (!quotation) return res.status(404).json({ message: "Platform quotation not found" });
      return res.status(200).json({ message: "Platform quotation fetched", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch platform quotation" });
    }
  },
);

router.post(
  "/",
  ...guard,
  withPermission(Permission.CREATE_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await platformQuotationService.create(req.body.request || req.body, currentUser.id);
      return res.status(201).json({ message: "Platform quotation created", data: quotation });
    } catch (error) {
      logger.error({ error: error.message }, "Failed to create platform quotation");
      return res.status(400).json({ message: error.message || "Failed to create platform quotation" });
    }
  },
);

router.patch(
  "/:id",
  ...guard,
  withPermission(Permission.CREATE_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await platformQuotationService.update(req.params.id, req.body.request || req.body, currentUser.id);
      return res.status(200).json({ message: "Platform quotation updated", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update platform quotation" });
    }
  },
);

router.get(
  "/:id/preview",
  ...guard,
  withPermission(Permission.GET_QUOTATIONS),
  async (req, res) => {
    try {
      const { html, printUrl } = await platformQuotationService.getPreview(req.params.id);
      return res.status(200).json({ message: "Preview generated", data: { html, printUrl } });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to generate preview" });
    }
  },
);

router.get(
  "/:id/pdf",
  ...guard,
  withPermission(Permission.EXPORT_QUOTATION),
  async (req, res) => {
    try {
      const { pdfBuffer, filename } = await platformQuotationService.getPdfBuffer(req.params.id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(pdfBuffer);
    } catch (error) {
      logger.error({ error: error.message }, "Failed to generate platform quotation PDF");
      return res.status(400).json({ message: error.message || "Failed to generate PDF" });
    }
  },
);

router.post(
  "/:id/send-email",
  ...guard,
  withPermission(Permission.SEND_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await platformQuotationService.sendEmail(
        req.params.id,
        req.body.request || req.body,
        currentUser.id,
      );
      return res.status(200).json({ message: "Platform quotation sent via email", data: quotation });
    } catch (error) {
      logger.error({ error: error.message }, "Failed to send platform quotation email");
      return res.status(400).json({ message: error.message || "Failed to send email" });
    }
  },
);

router.post(
  "/:id/accept",
  ...guard,
  withPermission(Permission.SEND_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await platformQuotationService.markAccepted(req.params.id, currentUser.id);
      return res.status(200).json({
        message: "Platform quotation accepted — school onboarding created",
        data: quotation,
      });
    } catch (error) {
      logger.error({ error: error.message }, "Failed to accept platform quotation");
      return res.status(400).json({ message: error.message || "Failed to accept platform quotation" });
    }
  },
);

router.post(
  "/:id/reject",
  ...guard,
  withPermission(Permission.SEND_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const reason = (req.body.request || req.body)?.reason;
      const quotation = await platformQuotationService.markRejected(req.params.id, reason, currentUser.id);
      return res.status(200).json({ message: "Platform quotation rejected", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to reject platform quotation" });
    }
  },
);

router.post(
  "/:id/expire",
  ...guard,
  withPermission(Permission.SEND_QUOTATION),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const quotation = await platformQuotationService.markExpired(req.params.id, currentUser.id);
      return res.status(200).json({ message: "Platform quotation marked as expired", data: quotation });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to expire platform quotation" });
    }
  },
);

export default router;
