import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import aiService from "../services/ai.service.js";

const router = Router();

// Process chatbot query
router.post(
  "/chat",
  withPermission(Permission.USE_CHATBOT),
  async (req, res) => {
    try {
      const { query } = req.body.request || {};
      const currentUser = req.context.user;

      if (!query) {
        return res.status(400).json({
          message: "Query is required",
        });
      }

      const result = await aiService.processQuery(
        currentUser.id,
        query,
        currentUser.schoolId,
      );

      return res.status(200).json({
        message: "Query processed successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to process query",
      });
    }
  },
);

// Get conversation history
router.get(
  "/conversations",
  withPermission(Permission.GET_CHATBOT_HISTORY),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      if (!currentUser || !currentUser.id) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      const result = await aiService.getUserConversations(currentUser.id, {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 20,
      });

      return res.status(200).json({
        message: "Conversations fetched successfully",
        data: result.conversations,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Get conversations error:", error);
      return res.status(400).json({
        message: error.message || "Failed to fetch conversations",
      });
    }
  },
);

// Get conversation by ID
router.get(
  "/conversations/:id",
  withPermission(Permission.GET_CHATBOT_HISTORY),
  async (req, res) => {
    try {
      const { id } = req.params;

      const conversation = await aiService.getConversation(id);

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }

      return res.status(200).json({
        message: "Conversation fetched successfully",
        data: conversation,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch conversation",
      });
    }
  },
);

// Create FAQ
router.post(
  "/faqs",
  withPermission(Permission.MANAGE_FAQ),
  async (req, res) => {
    try {
      const { question, answer, category, keywords = [] } = req.body.request || {};
      const currentUser = req.context.user;

      if (!question || !answer) {
        return res.status(400).json({
          message: "Question and answer are required",
        });
      }

      const faq = await aiService.createFAQ({
        question,
        answer,
        category,
        keywords,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "FAQ created successfully",
        data: faq,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create FAQ",
      });
    }
  },
);

// Get FAQs
router.get(
  "/faqs",
  withPermission(Permission.USE_CHATBOT),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await aiService.getFAQs(
        currentUser.schoolId,
        {
          category: query.category,
          search: query.search,
        },
        {
          page: parseInt(query.page) || 1,
          limit: parseInt(query.limit) || 20,
        },
      );

      return res.status(200).json({
        message: "FAQs fetched successfully",
        data: result.faqs,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch FAQs",
      });
    }
  },
);

// Update FAQ
router.put(
  "/faqs/:id",
  withPermission(Permission.MANAGE_FAQ),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { question, answer, category, keywords, isActive } = req.body.request || {};
      const currentUser = req.context.user;

      const faq = await prisma.fAQ.update({
        where: { id },
        data: {
          ...(question && { question }),
          ...(answer && { answer }),
          ...(category !== undefined && { category }),
          ...(keywords && { keywords }),
          ...(isActive !== undefined && { isActive }),
          updatedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "FAQ updated successfully",
        data: faq,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update FAQ",
      });
    }
  },
);

// Delete FAQ
router.delete(
  "/faqs/:id",
  withPermission(Permission.MANAGE_FAQ),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "FAQ" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      await prisma.fAQ.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.status(200).json({
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete FAQ",
      });
    }
  },
);

export default router;

