import { Router } from "express";
import { Permission } from "../prisma/generated/index.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const router = Router();

// List role templates (pre-built custom roles usable by any school)
router.get(
  "/role-templates",
  withPermission(Permission.GET_ROLES),
  async (req, res) => {
    try {
      const templates = await prisma.customRole.findMany({
        where: { isSystem: true, schoolId: null, deletedAt: null },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          permissions: true,
          isSystem: true,
        },
        orderBy: { displayName: "asc" },
      });
      return res.status(200).json({ message: "Role templates retrieved", data: templates });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to fetch role templates" });
    }
  },
);

// Apply a custom role / template to a user: copies the role's permissions into the user's
// additive permission overrides (merged with the user's system role permissions).
router.post(
  "/roles/:id/apply",
  withPermission(Permission.ASSIGN_USER_PERMISSIONS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { userId } = req.body.request || {};
      if (!userId) return res.status(400).json({ message: "userId is required" });

      const role = await prisma.customRole.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!role) return res.status(404).json({ message: "Role not found" });
      if (role.schoolId && role.schoolId !== currentUser.schoolId) {
        return res.status(403).json({ message: "This role is not available in your school" });
      }

      const target = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        include: { role: { select: { name: true } } },
      });
      if (!target) return res.status(404).json({ message: "User not found" });
      if (currentUser.schoolId && target.schoolId !== currentUser.schoolId) {
        return res.status(403).json({ message: "Cannot modify users outside your school" });
      }

      const basePermissions = Array.isArray(target.permissions) ? target.permissions : [];
      const merged = [...new Set([...basePermissions, ...(role.permissions || [])])];

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { permissions: merged, updatedBy: currentUser.id },
        select: { id: true, email: true, permissions: true },
      });

      return res.status(200).json({
        message: `Permissions of "${role.displayName || role.name}" applied to ${target.firstName} ${target.lastName || ""}`.trim(),
        data: updated,
      });
    } catch (error) {
      logger.error({ error }, "Failed to apply role");
      return res.status(400).json({ message: error.message || "Failed to apply role" });
    }
  },
);

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
