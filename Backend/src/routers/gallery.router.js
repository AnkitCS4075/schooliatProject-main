import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import galleryService from "../services/gallery.service.js";
import createGallerySchema from "../schemas/gallery/create-gallery.schema.js";
import uploadImageSchema from "../schemas/gallery/upload-image.schema.js";
import getGalleriesSchema from "../schemas/gallery/get-galleries.schema.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";

const router = Router();

// Create gallery
router.post(
  "/",
  withPermission(Permission.CREATE_GALLERY),
  validateRequest(createGallerySchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const gallery = await galleryService.createGallery({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Gallery created successfully",
        data: gallery,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create gallery",
      });
    }
  },
);

// Update gallery
router.put(
  "/:id",
  withPermission(Permission.EDIT_GALLERY),
  validateRequest(createGallerySchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const gallery = await galleryService.updateGallery(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Gallery updated successfully",
        data: gallery,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update gallery",
      });
    }
  },
);

// Get galleries
router.get(
  "/",
  withPermission(Permission.GET_GALLERIES),
  validateRequest(getGalleriesSchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await galleryService.getGalleries(
        currentUser.schoolId,
        {
          eventId: query.eventId,
          classId: query.classId,
          privacy: query.privacy,
        },
        {
          page: query.page,
          limit: query.limit,
        },
      );

      return res.status(200).json({
        message: "Galleries fetched successfully",
        data: result.galleries,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch galleries",
      });
    }
  },
);

// Get gallery by ID
router.get(
  "/:id",
  withPermission(Permission.GET_GALLERIES),
  async (req, res) => {
    try {
      const { id } = req.params;

      const gallery = await galleryService.getGalleryById(id);

      if (!gallery) {
        return res.status(404).json({
          message: "Gallery not found",
        });
      }

      return res.status(200).json({
        message: "Gallery fetched successfully",
        data: gallery,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch gallery",
      });
    }
  },
);

// Delete gallery
router.delete(
  "/:id",
  withPermission(Permission.DELETE_GALLERY),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "Gallery" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.gallery.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "Gallery deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete gallery",
      });
    }
  },
);

// Upload image
router.post(
  "/images",
  withPermission(Permission.UPLOAD_GALLERY_IMAGE),
  validateRequest(uploadImageSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const image = await galleryService.uploadImage({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Image uploaded successfully",
        data: image,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to upload image",
      });
    }
  },
);

// Delete image
router.delete(
  "/images/:id",
  withPermission(Permission.DELETE_GALLERY_IMAGE),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "GalleryImage" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await galleryService.deleteImage(id, currentUser.id);

      return res.status(200).json({
        message: "Image deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete image",
      });
    }
  },
);

export default router;

