import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import otherIncomeService from "../services/other-income.service.js";
import logger from "../config/logger.js";

const router = Router();

// Create other income
router.post(
  "/",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { title, description, amount, category, source, receivedAt, attachmentId } = req.body.request;

      const income = await otherIncomeService.create({
        schoolId: currentUser.schoolId,
        title,
        description,
        amount,
        category,
        source,
        receivedAt,
        receivedBy: currentUser.id,
        attachmentId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({ message: "Other income recorded", data: income });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to create other income" });
    }
  }
);

// List other incomes
router.get(
  "/",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { page, limit, category, dateFrom, dateTo } = req.query;

      const result = await otherIncomeService.list({
        schoolId: currentUser.schoolId,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        category,
        dateFrom,
        dateTo,
      });

      return res.json({ message: "Other incomes retrieved", data: result.items, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to list other incomes" });
    }
  }
);

// Get summary
router.get(
  "/summary",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { dateFrom, dateTo } = req.query;
      const summary = await otherIncomeService.getSummary(currentUser.schoolId, dateFrom, dateTo);
      return res.json({ message: "Summary retrieved", data: summary });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get summary" });
    }
  }
);

// Get by ID
router.get(
  "/:id",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const income = await otherIncomeService.getById(req.params.id, currentUser.schoolId);
      if (!income) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Other income retrieved", data: income });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get other income" });
    }
  }
);

// Update
router.patch(
  "/:id",
  withPermission([Permission.UPDATE_SCHOOL]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const income = await otherIncomeService.update(req.params.id, currentUser.schoolId, req.body.request, currentUser.id);
      return res.json({ message: "Other income updated", data: income });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update other income" });
    }
  }
);

// Delete
router.delete(
  "/:id",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      await otherIncomeService.remove(req.params.id, currentUser.schoolId, currentUser.id);
      return res.json({ message: "Other income deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to delete other income" });
    }
  }
);

export default router;
