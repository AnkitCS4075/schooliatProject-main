import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import { parsePagination } from "../utils/pagination.util.js";
import pkg from "../prisma/generated/index.js";
const { GalleryPrivacy } = pkg || {};

// Fallback if GalleryPrivacy enum doesn't exist
const PrivacyEnum = GalleryPrivacy || {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  SCHOOL_ONLY: "SCHOOL_ONLY",
};

/**
 * Create gallery
 * @param {Object} data - Gallery data
 * @returns {Promise<Object>} - Created gallery
 */
const createGallery = async (data) => {
  const {
    title,
    description = null,
    eventId = null,
    privacy = PrivacyEnum.PUBLIC,
    classId = null,
    schoolId,
    createdBy,
  } = data;

  const gallery = await prisma.gallery.create({
    data: {
      title,
      description,
      eventId,
      privacy,
      classId,
      schoolId,
      createdBy,
    },
  });

  return gallery;
};

/**
 * Update gallery
 * @param {string} galleryId - Gallery ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated gallery
 */
const updateGallery = async (galleryId, data) => {
  const updateData = { ...data };
  delete updateData.galleryId;

  const gallery = await prisma.gallery.update({
    where: { id: galleryId },
    data: {
      ...updateData,
      updatedBy: data.updatedBy,
    },
  });

  return gallery;
};

/**
 * Get galleries
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Galleries with pagination
 */
const getGalleries = async (schoolId, filters = {}, options = {}) => {
  const { page, limit, skip } = parsePagination(options);

  const where = {
    schoolId,
    deletedAt: null,
    isActive: true,
  };

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }

  if (filters.classId) {
    where.classId = filters.classId;
  }

  if (filters.privacy) {
    where.privacy = filters.privacy;
  }

  const [galleries, total] = await Promise.all([
    prisma.gallery.findMany({
      where,
      include: {
        images: {
          where: { deletedAt: null },
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.gallery.count({ where }),
  ]);

  return {
    galleries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Upload gallery image
 * @param {Object} data - Image data
 * @returns {Promise<Object>} - Created image
 */
const uploadImage = async (data) => {
  const {
    galleryId,
    fileId,
    caption = null,
    description = null,
    order = 0,
    schoolId,
    createdBy,
  } = data;

  const image = await prisma.galleryImage.create({
    data: {
      galleryId,
      fileId,
      caption,
      description,
      order,
      schoolId,
      createdBy,
    },
  });

  return image;
};

/**
 * Delete gallery image
 * @param {string} imageId - Image ID
 * @param {string} deletedBy - User ID
 * @returns {Promise<void>}
 */
const deleteImage = async (imageId, deletedBy) => {
  await prisma.galleryImage.update({
    where: { id: imageId },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });
};

/**
 * Get gallery by ID
 * @param {string} galleryId - Gallery ID
 * @returns {Promise<Object>} - Gallery with images
 */
const getGalleryById = async (galleryId) => {
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: {
      images: {
        where: { deletedAt: null },
        orderBy: { order: "asc" },
      },
    },
  });

  return gallery;
};

const galleryService = {
  createGallery,
  updateGallery,
  getGalleries,
  uploadImage,
  deleteImage,
  getGalleryById,
};

export default galleryService;

