import { Router } from "express";
import { Permission } from "../prisma/generated/index.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const router = Router();

// List all roles (system + custom)
router.get(
  "/roles/all",
  withPermission(Permission.GET_ROLES),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const systemRoles = await prisma.role.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, permissions: true },
      });
      const customRoles = await prisma.customRole.findMany({
        where: {
          deletedAt: null,
          OR: [
            { schoolId: currentUser.schoolId },
            { schoolId: null },
          ],
        },
        select: { id: true, name: true, displayName: true, description: true, permissions: true, isSystem: true, schoolId: true },
      });
      return res.status(200).json({
        message: "Roles retrieved",
        data: { systemRoles, customRoles },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch roles" });
    }
  },
);

// Create custom role
router.post(
  "/roles",
  withPermission(Permission.MANAGE_CUSTOM_ROLES),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { name, displayName, description, permissions } = req.body.request || {};
      if (!name || !displayName) {
        return res.status(400).json({ message: "Name and displayName are required" });
      }

      const existing = await prisma.customRole.findFirst({ where: { name } });
      if (existing) return res.status(400).json({ message: "Role name already exists" });

      const role = await prisma.customRole.create({
        data: {
          name,
          displayName,
          description: description || null,
          schoolId: currentUser.schoolId,
          permissions: permissions || [],
          createdBy: currentUser.id,
        },
      });
      return res.status(201).json({ message: "Custom role created", data: role });
    } catch (error) {
      logger.error({ error }, "Failed to create custom role");
      return res.status(400).json({ message: error.message || "Failed to create role" });
    }
  },
);

// Get custom role by ID
router.get(
  "/roles/:id",
  withPermission(Permission.GET_ROLES),
  async (req, res) => {
    try {
      const role = await prisma.customRole.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!role) return res.status(404).json({ message: "Role not found" });
      return res.status(200).json({ message: "Role retrieved", data: role });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch role" });
    }
  },
);

// Update custom role
router.patch(
  "/roles/:id",
  withPermission(Permission.MANAGE_CUSTOM_ROLES),
  async (req, res) => {
    try {
      const { displayName, description, permissions } = req.body.request || {};
      const currentUser = req.context.user;

      const role = await prisma.customRole.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!role) return res.status(404).json({ message: "Role not found" });
      if (role.isSystem) return res.status(400).json({ message: "Cannot modify system roles" });

      const updated = await prisma.customRole.update({
        where: { id: req.params.id },
        data: {
          ...(displayName !== undefined && { displayName }),
          ...(description !== undefined && { description }),
          ...(permissions !== undefined && { permissions }),
          updatedBy: currentUser.id,
        },
      });
      return res.status(200).json({ message: "Role updated", data: updated });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update role" });
    }
  },
);

// Delete custom role
router.delete(
  "/roles/:id",
  withPermission(Permission.MANAGE_CUSTOM_ROLES),
  async (req, res) => {
    try {
      const role = await prisma.customRole.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!role) return res.status(404).json({ message: "Role not found" });
      if (role.isSystem) return res.status(400).json({ message: "Cannot delete system roles" });

      await prisma.customRole.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date(), deletedBy: req.context.user.id },
      });
      return res.status(200).json({ message: "Role deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to delete role" });
    }
  },
);

// Get all available permissions
router.get(
  "/permissions",
  withPermission(Permission.GET_ROLES),
  async (req, res) => {
    try {
      // Return the Permission enum values from Prisma
      const { Permission } = await import("../prisma/generated/index.js");
      const permissionValues = Object.values(Permission);
      return res.status(200).json({ message: "Permissions retrieved", data: permissionValues });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch permissions" });
    }
  },
);

// Update user-level permissions
router.patch(
  "/users/:id/permissions",
  withPermission(Permission.ASSIGN_USER_PERMISSIONS),
  async (req, res) => {
    try {
      const { permissions } = req.body.request || {};
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "permissions must be an array" });
      }

      const user = await prisma.user.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { permissions },
        select: { id: true, email: true, permissions: true },
      });
      return res.status(200).json({ message: "User permissions updated", data: updated });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to update permissions" });
    }
  },
);

export default router;
