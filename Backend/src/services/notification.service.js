import prisma from "../prisma/client.js";
import { NotificationType } from "../prisma/generated/index.js";
import logger from "../config/logger.js";

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @param {string} data.userId - User ID to notify
 * @param {string} data.title - Notification title
 * @param {string} data.content - Notification content
 * @param {string} data.type - Notification type
 * @param {string} data.actionUrl - Optional action URL
 * @param {string} data.schoolId - Optional school ID
 * @param {string} data.createdBy - User ID creating the notification
 * @returns {Promise<Object>} - Created notification
 */
const createNotification = async (data) => {
  const {
    userId,
    title,
    content,
    type = NotificationType.GENERAL,
    actionUrl = null,
    schoolId = null,
    createdBy = "system",
  } = data;

  return await prisma.notification.create({
    data: {
      userId,
      title,
      content,
      type,
      actionUrl,
      schoolId,
      createdBy,
    },
  });
};

/**
 * Create bulk notifications for multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notificationData - Notification data (title, content, type, etc.)
 * @returns {Promise<Object>} - Result with count
 */
const createBulkNotifications = async (userIds, notificationData) => {
  const notifications = userIds.map((userId) => ({
    userId,
    title: notificationData.title,
    content: notificationData.content,
    type: notificationData.type || NotificationType.GENERAL,
    actionUrl: notificationData.actionUrl || null,
    schoolId: notificationData.schoolId || null,
    createdBy: notificationData.createdBy || "system",
  }));

  const result = await prisma.notification.createMany({
    data: notifications,
  });

  return { count: result.count };
};

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Notifications with pagination
 */
const getUserNotifications = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    isRead = null,
    type = null,
  } = options;

  const skip = (page - 1) * limit;

  const where = {
    userId,
    deletedAt: null,
  };

  if (isRead !== null) {
    where.isRead = isRead;
  }

  if (type) {
    where.type = type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} - Updated notification
 */
const markAsRead = async (notificationId, userId) => {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
      deletedAt: null,
    },
    data: {
      isRead: true,
    },
  });
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Update result
 */
const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
      deletedAt: null,
    },
    data: {
      isRead: true,
    },
  });
};

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Unread count
 */
const getUnreadCount = async (userId) => {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
      deletedAt: null,
    },
  });
};

const notificationService = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};

export default notificationService;

