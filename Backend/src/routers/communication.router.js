import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createConversationSchema from "../schemas/communication/create-conversation.schema.js";
import sendMessageSchema from "../schemas/communication/send-message.schema.js";
import sendTargetedMessageSchema from "../schemas/communication/send-targeted-message.schema.js";
import createAnnouncementSchema from "../schemas/communication/create-announcement.schema.js";
import communicationService from "../services/communication.service.js";
import notificationService from "../services/notification.service.js";
import logger from "../config/logger.js";

const router = Router();

// Create conversation
router.post(
  "/conversations",
  withPermission([Permission.SEND_MESSAGE]),
  validateRequest(createConversationSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { participants, type, title } = req.body.request;

    // Verify all participants exist and belong to same school (if school conversation)
    if (type === "SCHOOL" || type === "CLASS") {
      const users = await prisma.user.findMany({
        where: {
          id: { in: participants },
          schoolId: currentUser.schoolId,
          deletedAt: null,
        },
      });

      if (users.length !== participants.length) {
        return res.status(400).json({
          errorCode: "INVALID_PARTICIPANTS",
          message: "One or more participants not found or don't belong to your school",
        });
      }
    }

    try {
      const conversation = await communicationService.createConversation({
        participants,
        type,
        title: title || null,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      res.json({
        message: "Conversation created successfully",
        data: conversation,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to create conversation");
      res.status(400).json({
        errorCode: "CONVERSATION_CREATION_FAILED",
        message: error.message || "Failed to create conversation",
      });
    }
  },
);

// Get user conversations
router.get(
  "/conversations",
  withPermission([Permission.GET_MESSAGES]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { page = 1, limit = 20 } = req.query;

    try {
      const result = await communicationService.getUserConversations(currentUser.id, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json({
        message: "Conversations retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Failed to get conversations");
      res.status(500).json({
        errorCode: "CONVERSATIONS_FETCH_FAILED",
        message: "Failed to retrieve conversations",
      });
    }
  },
);

// Send message
const handleSendMessage = async (req, res) => {
  const currentUser = req.context.user;
  const { conversationId, content, attachments } = req.body.request;
  try {
    const message = await communicationService.sendMessage(
      conversationId,
      currentUser.id,
      content,
      attachments || [],
    );
    res.json({ message: "Message sent successfully", data: message });
  } catch (error) {
    logger.error({ error, conversationId }, "Failed to send message");
    res.status(400).json({
      errorCode: "MESSAGE_SEND_FAILED",
      message: error.message || "Failed to send message",
    });
  }
};

router.post(
  "/messages",
  withPermission([Permission.SEND_MESSAGE]),
  validateRequest(sendMessageSchema),
  handleSendMessage,
);

// Targeted send (Send To: Individual | Class | All Teachers | All Staff | Whole School)
router.post(
  "/messages/send",
  withPermission([Permission.SEND_MESSAGE]),
  validateRequest(sendTargetedMessageSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { content, target, attachments, channel } = req.body.request;
    try {
      const result = await communicationService.sendTargetedMessage({
        type: target.type,
        userId: target.userId || null,
        classId: target.classId || null,
        content,
        attachments: attachments || [],
        senderId: currentUser.id,
        schoolId: currentUser.schoolId,
        channel: channel || "in_app",
      });
      res.json({
        message: "Message sent successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to send targeted message");
      res.status(400).json({
        errorCode: "TARGETED_MESSAGE_SEND_FAILED",
        message: error.message || "Failed to send message",
      });
    }
  },
);

// Mobile API: POST /communication/conversations/:id/messages (conversationId in URL)
router.post(
  "/conversations/:id/messages",
  withPermission([Permission.SEND_MESSAGE]),
  (req, _res, next) => {
    req.body.request = { ...(req.body?.request || {}), conversationId: req.params.id };
    next();
  },
  validateRequest(sendMessageSchema),
  handleSendMessage,
);

// Get conversation messages
router.get(
  "/conversations/:conversationId/messages",
  withPermission([Permission.GET_MESSAGES]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { conversationId } = req.params;
    const { page = 1, limit = 50, beforeMessageId = null } = req.query;

    try {
      const result = await communicationService.getConversationMessages(
        conversationId,
        currentUser.id,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          beforeMessageId: beforeMessageId || null,
        },
      );

      res.json({
        message: "Messages retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error, conversationId }, "Failed to get messages");
      res.status(400).json({
        errorCode: "MESSAGES_FETCH_FAILED",
        message: error.message || "Failed to retrieve messages",
      });
    }
  },
);

// Recipient search for the messaging composer (only requires SEND_MESSAGE, not GET_USERS)
router.get(
  "/recipients",
  withPermission([Permission.SEND_MESSAGE]),
  async (req, res) => {
    const currentUser = req.context.user;
    const search = String(req.query.search || "").trim();
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const where = { deletedAt: null, deletedBy: null };
    if (currentUser.schoolId) where.schoolId = currentUser.schoolId;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { publicUserId: { contains: search, mode: "insensitive" } },
      ];
    }

    try {
      const users = await prisma.user.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          publicUserId: true,
          email: true,
          userType: true,
          roleId: true,
          role: { select: { id: true, name: true } },
          school: { select: { id: true, name: true } },
        },
      });

      const userIds = users.map((u) => u.id);
      const profiles = await prisma.studentProfile.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, classId: true },
      });
      const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p.classId]));

      const data = users.map((u) => ({
        ...u,
        role: u.role ? { id: u.role.id, name: u.role.name } : null,
        classId: profileMap[u.id] || null,
      }));

      res.json({ message: "Recipients retrieved", data });
    } catch (error) {
      logger.error({ error }, "Failed to fetch recipients");
      res.status(500).json({
        errorCode: "RECIPIENTS_FETCH_FAILED",
        message: error.message || "Failed to retrieve recipients",
      });
    }
  },
);

// Create announcement
router.post(
  "/announcements",
  withPermission([Permission.CREATE_ANNOUNCEMENT]),
  validateRequest(createAnnouncementSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const {
      title,
      content,
      targetUserIds,
      targetRoles,
      targetSchoolIds,
      type: announcementType,
    } = req.body.request;

    // Only school admin and super admin can create announcements
    if (currentUser.role.name !== "SCHOOL_ADMIN" && currentUser.role.name !== "SUPER_ADMIN") {
      return res.status(403).json({
        errorCode: "FORBIDDEN",
        message: "Only administrators can create announcements",
      });
    }

    try {
      const result = await communicationService.createAnnouncement({
        title,
        content,
        targetUserIds: targetUserIds || [],
        targetRoles: targetRoles || [],
        targetSchoolIds: targetSchoolIds || [],
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
        announcementType,
      });

      res.json({
        message: "Announcement created and sent successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Failed to create announcement");
      res.status(400).json({
        errorCode: "ANNOUNCEMENT_CREATION_FAILED",
        message: error.message || "Failed to create announcement",
      });
    }
  },
);

// Mobile API: GET /communication/announcements (notifications with type ANNOUNCEMENT)
router.get(
  "/announcements",
  withPermission([Permission.SEND_NOTIFICATION]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { page = 1, limit = 20 } = req.query;
    try {
      const result = await notificationService.getUserNotifications(currentUser.id, {
        page: parseInt(page),
        limit: parseInt(limit),
        type: "ANNOUNCEMENT",
      });
      res.json({
        message: "Announcements fetched successfully",
        data: result.notifications ?? [],
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error({ error }, "Failed to get announcements");
      res.status(500).json({
        errorCode: "ANNOUNCEMENTS_FETCH_FAILED",
        message: "Failed to retrieve announcements",
      });
    }
  },
);

// Get notifications
router.get(
  "/notifications",
  withPermission([Permission.SEND_NOTIFICATION]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { isRead = null, type = null, page = 1, limit = 20 } = req.query;

    try {
      const result = await notificationService.getUserNotifications(currentUser.id, {
        page: parseInt(page),
        limit: parseInt(limit),
        isRead: isRead === "true" ? true : isRead === "false" ? false : null,
        type: type || null,
      });

      res.json({
        message: "Notifications retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Failed to get notifications");
      res.status(500).json({
        errorCode: "NOTIFICATIONS_FETCH_FAILED",
        message: "Failed to retrieve notifications",
      });
    }
  },
);

// Mark notification as read
router.put(
  "/notifications/:notificationId/read",
  withPermission([Permission.SEND_NOTIFICATION]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { notificationId } = req.params;

    try {
      await notificationService.markAsRead(notificationId, currentUser.id);

      res.json({
        message: "Notification marked as read",
      });
    } catch (error) {
      logger.error({ error, notificationId }, "Failed to mark notification as read");
      res.status(400).json({
        errorCode: "MARK_READ_FAILED",
        message: "Failed to mark notification as read",
      });
    }
  },
);

// Mark all notifications as read
router.put(
  "/notifications/read-all",
  withPermission([Permission.SEND_NOTIFICATION]),
  async (req, res) => {
    const currentUser = req.context.user;

    try {
      await notificationService.markAllAsRead(currentUser.id);

      res.json({
        message: "All notifications marked as read",
      });
    } catch (error) {
      logger.error({ error }, "Failed to mark all notifications as read");
      res.status(500).json({
        errorCode: "MARK_ALL_READ_FAILED",
        message: "Failed to mark all notifications as read",
      });
    }
  },
);

// Get unread notification count
router.get(
  "/notifications/unread-count",
  withPermission([Permission.SEND_NOTIFICATION]),
  async (req, res) => {
    const currentUser = req.context.user;

    try {
      const count = await notificationService.getUnreadCount(currentUser.id);

      res.json({
        message: "Unread count retrieved successfully",
        data: {
          count,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to get unread count");
      res.status(500).json({
        errorCode: "UNREAD_COUNT_FETCH_FAILED",
        message: "Failed to retrieve unread count",
      });
    }
  },
);

export default router;

