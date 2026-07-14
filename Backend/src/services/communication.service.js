import prisma from "../prisma/client.js";
import {
  ConversationType,
  RoleName,
  NotificationType,
} from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";

/**
 * Create conversation
 * @param {Object} data - Conversation data
 * @param {Array<string>} data.participants - Array of user IDs
 * @param {string} data.type - Conversation type
 * @param {string} data.title - Conversation title (optional)
 * @param {string} data.schoolId - School ID (optional)
 * @param {string} data.createdBy - User ID creating conversation
 * @returns {Promise<Object>} - Created conversation
 */
const createConversation = async (data) => {
  const {
    participants,
    type,
    title = null,
    schoolId = null,
    createdBy,
  } = data;

  // Ensure creator is in participants
  if (!participants.includes(createdBy)) {
    participants.push(createdBy);
  }

  // Remove duplicates
  const uniqueParticipants = [...new Set(participants)];

  // Check if conversation already exists (for direct messages)
  if (type === ConversationType.DIRECT && uniqueParticipants.length === 2) {
    const existing = await prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          hasEvery: uniqueParticipants,
        },
        deletedAt: null,
      },
    });

    if (existing) {
      return existing;
    }
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: uniqueParticipants,
      type,
      title,
      schoolId,
      createdBy,
    },
  });

  return conversation;
};

/**
 * Send message
 * @param {string} conversationId - Conversation ID
 * @param {string} senderId - Sender user ID
 * @param {string} content - Message content
 * @param {Array<string>} attachments - Array of file IDs
 * @returns {Promise<Object>} - Created message
 */
const sendMessage = async (conversationId, senderId, content, attachments = []) => {
  // Verify sender is participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (!conversation.participants.includes(senderId)) {
    throw new Error("You are not a participant in this conversation");
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      attachments,
      createdBy: senderId,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Send notifications to other participants
  const otherParticipants = conversation.participants.filter((id) => id !== senderId);
  if (otherParticipants.length > 0) {
    await notificationService.createBulkNotifications(otherParticipants, {
      title: "New Message",
      content: content.length > 100 ? content.substring(0, 100) + "..." : content,
      type: "GENERAL",
      actionUrl: `/messages/${conversationId}`,
      schoolId: conversation.schoolId,
      createdBy: senderId,
    });
  }

  return message;
};

/**
 * Get conversations for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Conversations with pagination
 */
const getUserConversations = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        participants: {
          has: userId,
        },
        deletedAt: null,
      },
      include: {
        messages: {
          orderBy: {
            sentAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.conversation.count({
      where: {
        participants: {
          has: userId,
        },
        deletedAt: null,
      },
    }),
  ]);

  const convIds = conversations.map((c) => c.id);
  const unreadMessages = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: convIds },
      deletedAt: null,
      NOT: { readBy: { has: userId } },
    },
    _count: { id: true },
  });
  const unreadMap = Object.fromEntries(
    unreadMessages.map((u) => [u.conversationId, u._count.id]),
  );

  const conversationsWithUnread = conversations.map((c) => ({
    ...c,
    unreadCount: unreadMap[c.id] || 0,
  }));

  return {
    conversations: conversationsWithUnread,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get messages in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID (for access verification)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Messages with pagination
 */
const getConversationMessages = async (conversationId, userId, options = {}) => {
  const { page = 1, limit = 50, beforeMessageId = null } = options;
  const skip = (page - 1) * limit;

  // Verify user is participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || !conversation.participants.includes(userId)) {
    throw new Error("Conversation not found or access denied");
  }

  const where = {
    conversationId,
    deletedAt: null,
  };

  if (beforeMessageId) {
    const beforeMessage = await prisma.message.findUnique({
      where: { id: beforeMessageId },
    });
    if (beforeMessage) {
      where.sentAt = {
        lt: beforeMessage.sentAt,
      };
    }
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  // Mark messages as read
  const messageIds = messages.map((m) => m.id);
  await prisma.message.updateMany({
    where: {
      id: { in: messageIds },
      readBy: {
        hasNot: userId,
      },
    },
    data: {
      readBy: {
        push: userId,
      },
    },
  });

  return {
    messages: messages.reverse(), // Reverse to show oldest first
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create announcement
 * @param {Object} data - Announcement data
 * @param {string} data.title - Announcement title
 * @param {string} data.content - Announcement content
 * @param {Array<string>} data.targetUserIds - Target user IDs (empty for all)
 * @param {Array<string>} data.targetRoles - Target roles (optional)
 * @param {string} data.schoolId - School ID
 * @param {string} data.createdBy - User ID creating announcement
 * @returns {Promise<Object>} - Result with notification count
 */
const createAnnouncement = async (data) => {
  const {
    title,
    content,
    targetUserIds = [],
    targetRoles = [],
    targetSchoolIds = [],
    schoolId,
    createdBy,
    announcementType,
  } = data;

  const resolvedNotificationType =
    announcementType === "PAYMENT_REMINDER"
      ? NotificationType.FEE
      : NotificationType.ANNOUNCEMENT;

  // Super-admin payment reminders: notify school admins per selected school
  if (Array.isArray(targetSchoolIds) && targetSchoolIds.length > 0) {
    const schoolAdminRole = await prisma.role.findFirst({
      where: { name: RoleName.SCHOOL_ADMIN },
      select: { id: true },
    });
    if (!schoolAdminRole) {
      throw new Error("School admin role is not configured");
    }
    let totalSent = 0;
    for (const sid of targetSchoolIds) {
      const admins = await prisma.user.findMany({
        where: {
          schoolId: sid,
          roleId: schoolAdminRole.id,
          deletedAt: null,
        },
        select: { id: true },
      });
      const ids = admins.map((a) => a.id);
      if (ids.length === 0) {
        continue;
      }
      const result = await notificationService.createBulkNotifications(ids, {
        title,
        content,
        type: resolvedNotificationType,
        schoolId: sid,
        createdBy,
      });
      totalSent += result.count;
    }
    return {
      notificationsSent: totalSent,
      targetUsers: totalSent,
    };
  }

  let userIds = [...targetUserIds];

  // If roles specified, get users with those roles
  if (targetRoles.length > 0) {
    const roleNames = await prisma.role.findMany({
      where: {
        name: {
          in: targetRoles,
        },
      },
      select: {
        id: true,
      },
    });

    const roleIds = roleNames.map((r) => r.id);

    const users = await prisma.user.findMany({
      where: {
        roleId: { in: roleIds },
        schoolId: schoolId || undefined,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    userIds = [...new Set([...userIds, ...users.map((u) => u.id)])];
  }

  // If no specific targets, send to all school users
  if (userIds.length === 0 && schoolId) {
    const allUsers = await prisma.user.findMany({
      where: {
        schoolId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    userIds = allUsers.map((u) => u.id);
  }

  // Create notifications
  const result = await notificationService.createBulkNotifications(userIds, {
    title,
    content,
    type: resolvedNotificationType,
    schoolId,
    createdBy,
  });

  return {
    notificationsSent: result.count,
    targetUsers: userIds.length,
  };
};

const communicationService = {
  createConversation,
  sendMessage,
  getUserConversations,
  getConversationMessages,
  createAnnouncement,
};

export default communicationService;

