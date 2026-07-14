import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import parentService from "../services/parent.service.js";

const router = Router();

// Get children
router.get(
  "/children",
  withPermission(Permission.GET_CHILDREN),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      const children = await parentService.getChildren(currentUser.id);

      return res.status(200).json({
        message: "Children fetched successfully",
        data: children,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch children",
      });
    }
  },
);

// Get child data
router.get(
  "/children/:childId",
  withPermission(Permission.GET_CHILD_DATA),
  async (req, res) => {
    try {
      const { childId } = req.params;
      const currentUser = req.context.user;

      const childData = await parentService.getChildData(currentUser.id, childId);

      return res.status(200).json({
        message: "Child data fetched successfully",
        data: childData,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch child data",
      });
    }
  },
);

// Get consolidated dashboard
router.get(
  "/dashboard",
  withPermission(Permission.GET_CONSOLIDATED_DASHBOARD),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      const dashboard = await parentService.getConsolidatedDashboard(currentUser.id);

      return res.status(200).json({
        message: "Dashboard data fetched successfully",
        data: dashboard,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch dashboard",
      });
    }
  },
);

// Link child to parent
router.post(
  "/children/:childId/link",
  withPermission(Permission.GET_CHILDREN),
  async (req, res) => {
    try {
      const { childId } = req.params;
      const { relationship, isPrimary = false } = req.body.request || {};
      const currentUser = req.context.user;

      if (!relationship) {
        return res.status(400).json({
          message: "Relationship is required",
        });
      }

      const link = await parentService.linkChild({
        parentId: currentUser.id,
        childId,
        relationship,
        isPrimary,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Child linked successfully",
        data: link,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to link child",
      });
    }
  },
);

export default router;

