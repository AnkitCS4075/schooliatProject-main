import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName } from "../prisma/generated/index.js";
import paginateUtil from "../utils/paginate.util.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createGrievanceSchema from "../schemas/grievance/create-grievance.schema.js";
import getGrievancesSchema from "../schemas/grievance/get-grievances.schema.js";
import getGrievanceSchema from "../schemas/grievance/get-grievance.schema.js";
import updateGrievanceSchema from "../schemas/grievance/update-grievance.schema.js";
import addCommentSchema from "../schemas/grievance/add-comment.schema.js";

const router = Router();

// Helper to get grievance select object with includes
const getGrievanceSelect = () => ({
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  },
  school: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  comments: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
});

// Create a new grievance (School Admins and Employees)
router.post(
  "/",
  withPermission(Permission.CREATE_GRIEVANCE),
  validateRequest(createGrievanceSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { title, description, priority } = req.body.request;

    const newGrievance = await prisma.grievance.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        createdById: currentUser.id,
        schoolId: currentUser.schoolId || null,
      },
      select: getGrievanceSelect(),
    });

    return res.status(201).json({
      message: "Grievance created successfully!",
      data: newGrievance,
    });
  },
);

// Get all grievances (Super Admin - can see all, Others see their own)
router.get(
  "/",
  withPermission(Permission.GET_GRIEVANCES),
  validateRequest(getGrievancesSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const userRole = currentUser.role?.name;
    const { status, priority, schoolId, platformOnly } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (userRole === RoleName.SUPER_ADMIN) {
      if (platformOnly === "true") {
        where.schoolId = null;
      } else if (schoolId) {
        where.schoolId = schoolId;
      }
    } else if (currentUser.schoolId) {
      where.schoolId = currentUser.schoolId;
    } else {
      return res.json({
        message: "Grievances fetched successfully!",
        data: [],
        total: 0,
      });
    }

    const grievances = await prisma.grievance.findMany({
      where,
      select: getGrievanceSelect(),
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      ...paginateUtil.getPaginationParams(req),
    });

    const total = await prisma.grievance.count({ where });

    return res.json({
      message: "Grievances fetched successfully!",
      data: grievances,
      total,
    });
  },
);

// Get my grievances (School Admins and Employees can see their own)
router.get(
  "/my",
  withPermission(Permission.GET_MY_GRIEVANCES),
  validateRequest(getGrievancesSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { status, priority } = req.query;

    const where = {
      createdById: currentUser.id,
    };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const grievances = await prisma.grievance.findMany({
      where,
      select: getGrievanceSelect(),
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      ...paginateUtil.getPaginationParams(req),
    });

    const total = await prisma.grievance.count({ where });

    return res.json({
      message: "Your grievances fetched successfully!",
      data: grievances,
      total,
    });
  },
);

// Get a single grievance by ID
router.get(
  "/:id",
  withPermission(Permission.GET_MY_GRIEVANCES),
  validateRequest(getGrievanceSchema),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const grievance = await prisma.grievance.findUnique({
      where: { id },
      select: getGrievanceSelect(),
    });

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found!" });
    }

    // Check if user has permission to view this grievance
    const userRole = await prisma.role.findUnique({
      where: { id: currentUser.roleId },
    });

    const isSuperAdmin = userRole?.name === RoleName.SUPER_ADMIN;
    const isOwner = grievance.createdBy.id === currentUser.id;

    if (!isSuperAdmin && !isOwner) {
      return res.status(403).json({
        message: "You do not have permission to view this grievance.",
      });
    }

    return res.json({
      message: "Grievance fetched successfully!",
      data: grievance,
    });
  },
);

// Update grievance status (Super Admin only)
router.patch(
  "/:id",
  withPermission(Permission.UPDATE_GRIEVANCE),
  validateRequest(updateGrievanceSchema),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;
    const { status, priority } = req.body.request;

    const existingGrievance = await prisma.grievance.findUnique({
      where: { id },
    });

    if (!existingGrievance) {
      return res.status(404).json({ message: "Grievance not found!" });
    }

    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === "RESOLVED" || status === "CLOSED") {
        updateData.resolvedById = currentUser.id;
        updateData.resolvedAt = new Date();
      }
    }
    if (priority !== undefined) updateData.priority = priority;

    const updatedGrievance = await prisma.grievance.update({
      where: { id },
      data: updateData,
      select: getGrievanceSelect(),
    });

    return res.json({
      message: "Grievance updated successfully!",
      data: updatedGrievance,
    });
  },
);

// Add a comment to a grievance
router.post(
  "/:id/comments",
  withPermission(Permission.ADD_GRIEVANCE_COMMENT),
  validateRequest(addCommentSchema),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;
    const { content } = req.body.request;

    const existingGrievance = await prisma.grievance.findUnique({
      where: { id },
      select: { id: true, createdById: true },
    });

    if (!existingGrievance) {
      return res.status(404).json({ message: "Grievance not found!" });
    }

    // Check if user has permission to comment
    const userRole = await prisma.role.findUnique({
      where: { id: currentUser.roleId },
    });

    const isSuperAdmin = userRole?.name === RoleName.SUPER_ADMIN;
    const isOwner = existingGrievance.createdById === currentUser.id;

    if (!isSuperAdmin && !isOwner) {
      return res.status(403).json({
        message: "You do not have permission to comment on this grievance.",
      });
    }

    const newComment = await prisma.grievanceComment.create({
      data: {
        content,
        grievanceId: id,
        authorId: currentUser.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // If Super Admin comments on a grievance that is OPEN, set it to IN_PROGRESS
    if (isSuperAdmin && !isOwner) {
      const grievance = await prisma.grievance.findUnique({
        where: { id },
        select: { status: true },
      });
      if (grievance?.status === "OPEN") {
        await prisma.grievance.update({
          where: { id },
          data: { status: "IN_PROGRESS" },
        });
      }
    }

    return res.status(201).json({
      message: "Comment added successfully!",
      data: newComment,
    });
  },
);

export default router;
