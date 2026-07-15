import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import feeDiscountService from "../services/fee-discount.service.js";
import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const router = Router();

// ─── Discount CRUD ──────────────────────────────────────────────────────

// Create discount
router.post(
  "/discounts",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const discount = await feeDiscountService.createDiscount({
        ...req.body.request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });
      return res.status(201).json({ message: "Discount created successfully", data: discount });
    } catch (error) {
      logger.error({ error }, "Failed to create discount");
      return res.status(400).json({ message: error.message || "Failed to create discount" });
    }
  },
);

// List discounts
router.get(
  "/discounts",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const result = await feeDiscountService.getDiscounts(currentUser.schoolId, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
        type: req.query.type || undefined,
        classId: req.query.classId || undefined,
      });
      return res.status(200).json({ message: "Discounts retrieved", data: result.discounts, pagination: result.pagination });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch discounts" });
    }
  },
);

// Get discount stats
router.get(
  "/discounts/stats",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const stats = await feeDiscountService.getDiscountStats(req.context.user.schoolId);
      return res.status(200).json({ message: "Stats retrieved", data: stats });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch stats" });
    }
  },
);

// Get discount by ID
router.get(
  "/discounts/:id",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const discount = await feeDiscountService.getDiscountById(req.params.id, req.context.user.schoolId);
      if (!discount) return res.status(404).json({ message: "Discount not found" });
      return res.status(200).json({ message: "Discount retrieved", data: discount });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch discount" });
    }
  },
);

// Update discount
router.put(
  "/discounts/:id",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const discount = await feeDiscountService.updateDiscount(
        req.params.id,
        req.context.user.schoolId,
        { ...req.body.request, updatedBy: req.context.user.id },
      );
      return res.status(200).json({ message: "Discount updated", data: discount });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update discount" });
    }
  },
);

// Delete discount
router.delete(
  "/discounts/:id",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      await feeDiscountService.deleteDiscount(req.params.id, req.context.user.schoolId, req.context.user.id);
      return res.status(200).json({ message: "Discount deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to delete discount" });
    }
  },
);

// Apply discount to installment
router.post(
  "/discounts/apply",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const application = await feeDiscountService.applyDiscount({
        ...req.body.request,
        schoolId: req.context.user.schoolId,
        appliedBy: req.context.user.id,
      });
      return res.status(201).json({ message: "Discount applied successfully", data: application });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to apply discount" });
    }
  },
);

// ─── Late Fee Rules ──────────────────────────────────────────────────────

// Create or update late fee rule (upsert per school)
router.post(
  "/late-fee-rules",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const data = req.body.request;

      const existing = await prisma.lateFeeRule.findFirst({
        where: { schoolId: currentUser.schoolId, deletedAt: null },
      });

      let rule;
      if (existing) {
        rule = await prisma.lateFeeRule.update({
          where: { id: existing.id },
          data: {
            name: data.name ?? existing.name,
            description: data.description ?? existing.description,
            calculationType: data.calculationType ?? existing.calculationType,
            fixedAmount: data.fixedAmount !== undefined ? data.fixedAmount : existing.fixedAmount,
            percentage: data.percentage !== undefined ? data.percentage : existing.percentage,
            amountPerDay: data.amountPerDay !== undefined ? data.amountPerDay : existing.amountPerDay,
            gracePeriodDays: data.gracePeriodDays ?? existing.gracePeriodDays,
            maxLateFee: data.maxLateFee !== undefined ? data.maxLateFee : existing.maxLateFee,
            isActive: data.isActive ?? existing.isActive,
            updatedBy: currentUser.id,
          },
        });
      } else {
        rule = await prisma.lateFeeRule.create({
          data: {
            schoolId: currentUser.schoolId,
            name: data.name,
            description: data.description || null,
            calculationType: data.calculationType,
            fixedAmount: data.fixedAmount || null,
            percentage: data.percentage || null,
            amountPerDay: data.amountPerDay || null,
            gracePeriodDays: data.gracePeriodDays || 0,
            maxLateFee: data.maxLateFee || null,
            isActive: data.isActive ?? true,
            createdBy: currentUser.id,
          },
        });
      }

      return res.status(201).json({ message: "Late fee rule saved", data: rule });
    } catch (error) {
      logger.error({ error }, "Failed to save late fee rule");
      return res.status(400).json({ message: error.message || "Failed to save late fee rule" });
    }
  },
);

// Get late fee rule for school
router.get(
  "/late-fee-rules",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const rule = await prisma.lateFeeRule.findFirst({
        where: { schoolId: req.context.user.schoolId, deletedAt: null },
      });
      return res.status(200).json({ message: "Late fee rule retrieved", data: rule || null });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch late fee rule" });
    }
  },
);

// Calculate & apply late fees
router.post(
  "/late-fee-rules/calculate",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const result = await feeDiscountService.calculateLateFees(
        req.context.user.schoolId,
        req.context.user.id,
      );
      return res.status(200).json({ message: "Late fees calculated", data: result });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to calculate late fees" });
    }
  },
);

export default router;
