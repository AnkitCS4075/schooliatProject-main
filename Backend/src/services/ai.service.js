import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import pkg from "../prisma/generated/index.js";
const { ChatbotIntent } = pkg || {};

// Fallback if ChatbotIntent enum doesn't exist
const IntentEnum = ChatbotIntent || {
  GENERAL_QUERY: "GENERAL_QUERY",
  ATTENDANCE_QUERY: "ATTENDANCE_QUERY",
  HOMEWORK_QUERY: "HOMEWORK_QUERY",
  EXAM_QUERY: "EXAM_QUERY",
  FEE_QUERY: "FEE_QUERY",
  TIMETABLE_QUERY: "TIMETABLE_QUERY",
};

/**
 * Create chatbot conversation
 * @param {Object} data - Conversation data
 * @returns {Promise<Object>} - Created conversation
 */
const createConversation = async (data) => {
  const { userId, intent = null, context = null, schoolId = null } = data;

  const conversation = await prisma.chatbotConversation.create({
    data: {
      userId,
      intent,
      context,
      schoolId,
    },
  });

  return conversation;
};

/**
 * Add message to conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} data - Message data
 * @returns {Promise<Object>} - Created message
 */
const addMessage = async (conversationId, data) => {
  const { role, content, metadata = null } = data;

  const message = await prisma.chatbotMessage.create({
    data: {
      conversationId,
      role,
      content,
      metadata,
    },
  });

  return message;
};

/**
 * Get conversation history
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - Conversation with messages
 */
const getConversation = async (conversationId) => {
  const conversation = await prisma.chatbotConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  return conversation;
};

/**
 * Get user conversations
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Conversations with pagination
 */
const getUserConversations = async (userId, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.chatbotConversation.findMany({
      where: {
        userId,
      },
      include: {
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.chatbotConversation.count({
      where: { userId },
    }),
  ]);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Process chatbot query
 * @param {string} userId - User ID
 * @param {string} query - User query
 * @param {string} schoolId - School ID
 * @returns {Promise<Object>} - Response data
 */
const processQuery = async (userId, query, schoolId = null) => {
  // Detect intent from query
  const lowerQuery = query.toLowerCase();

  let intent = IntentEnum.GENERAL_QUERY;
  if (lowerQuery.includes("attendance")) {
    intent = IntentEnum.ATTENDANCE_QUERY;
  } else if (lowerQuery.includes("homework") || lowerQuery.includes("assignment")) {
    intent = IntentEnum.HOMEWORK_QUERY;
  } else if (lowerQuery.includes("exam") || lowerQuery.includes("result")) {
    intent = IntentEnum.EXAM_QUERY;
  } else if (lowerQuery.includes("fee") || lowerQuery.includes("payment")) {
    intent = IntentEnum.FEE_QUERY;
  } else if (lowerQuery.includes("timetable") || lowerQuery.includes("schedule")) {
    intent = IntentEnum.TIMETABLE_QUERY;
  }

  // Get or create conversation
  let conversation = await prisma.chatbotConversation.findFirst({
    where: {
      userId,
      schoolId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!conversation) {
    conversation = await createConversation({
      userId,
      intent,
      schoolId,
    });
  }

  // Add user message
  await addMessage(conversation.id, {
    role: "user",
    content: query,
  });

  // Generate response based on intent
  let response = "I'm here to help! How can I assist you today?";
  let context = null;

  if (intent === IntentEnum.ATTENDANCE_QUERY) {
    // Get user's attendance data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentAttendances: {
          where: {
            deletedAt: null,
          },
          take: 10,
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (user && user.studentAttendances.length > 0) {
      const presentCount = user.studentAttendances.filter((a) => a.status === "PRESENT").length;
      response = `Your recent attendance shows ${presentCount} out of ${user.studentAttendances.length} days present.`;
      context = { attendanceCount: user.studentAttendances.length, presentCount };
    } else {
      response = "I couldn't find your attendance records. Please contact your school administrator.";
    }
  } else if (intent === IntentEnum.HOMEWORK_QUERY) {
    // Get user's homework
    const homework = await prisma.homeworkSubmission.findMany({
      where: {
        studentId: userId,
        deletedAt: null,
      },
      include: {
        homework: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    const pending = homework.filter((h) => h.status === "PENDING");
    if (pending.length > 0) {
      response = `You have ${pending.length} pending homework assignment(s).`;
      context = { pendingCount: pending.length };
    } else {
      response = "You have no pending homework assignments. Great job!";
    }
  } else if (intent === IntentEnum.EXAM_QUERY) {
    // Get user's exam results
    const results = await prisma.result.findMany({
      where: {
        studentId: userId,
        deletedAt: null,
      },
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (results.length > 0) {
      response = `You have ${results.length} recent exam result(s) available.`;
      context = { resultsCount: results.length };
    } else {
      response = "No exam results found. Please check back later.";
    }
  } else if (intent === IntentEnum.FEE_QUERY) {
    // Get user's fee status
    const fees = await prisma.feeInstallements.findMany({
      where: {
        studentId: userId,
        deletedAt: null,
      },
      take: 5,
    });

    const pending = fees.filter((f) => f.status === "PENDING");
    if (pending.length > 0) {
      const totalPending = pending.reduce((sum, f) => sum + Number(f.amount || 0), 0);
      response = `You have ${pending.length} pending fee installment(s) totaling ₹${totalPending}.`;
      context = { pendingCount: pending.length, totalPending };
    } else {
      response = "All your fees are up to date. Great!";
    }
  } else {
    // Check FAQs
    const faqs = await prisma.fAQ.findMany({
      where: {
        OR: [
          { schoolId: schoolId },
          { schoolId: null }, // Global FAQs
        ],
        isActive: true,
        deletedAt: null,
      },
      take: 5,
    });

    // Simple keyword matching
    for (const faq of faqs) {
      const keywords = faq.keywords || [];
      const queryWords = lowerQuery.split(" ");
      const matchCount = keywords.filter((kw) =>
        queryWords.some((qw) => qw.includes(kw.toLowerCase()) || kw.toLowerCase().includes(qw)),
      ).length;

      if (matchCount > 0) {
        response = faq.answer;
        // Increment view count
        await prisma.fAQ.update({
          where: { id: faq.id },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        });
        break;
      }
    }
  }

  // Add assistant response
  await addMessage(conversation.id, {
    role: "assistant",
    content: response,
    metadata: context,
  });

  // Update conversation
  await prisma.chatbotConversation.update({
    where: { id: conversation.id },
    data: {
      intent,
      context,
      updatedAt: new Date(),
    },
  });

  return {
    conversationId: conversation.id,
    response,
    intent,
    context,
  };
};

/**
 * Create FAQ
 * @param {Object} data - FAQ data
 * @returns {Promise<Object>} - Created FAQ
 */
const createFAQ = async (data) => {
  const {
    question,
    answer,
    category = null,
    keywords = [],
    schoolId = null,
    createdBy,
  } = data;

  const faq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      category,
      keywords,
      schoolId,
      createdBy,
    },
  });

  return faq;
};

/**
 * Get FAQs
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - FAQs with pagination
 */
const getFAQs = async (schoolId, filters = {}, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const andConditions = [
    {
      OR: [
        ...(schoolId ? [{ schoolId }] : []),
        { schoolId: null },
      ],
    },
    { isActive: true },
    { deletedAt: null },
  ];

  if (filters.category) {
    andConditions.push({ category: filters.category });
  }

  if (filters.search) {
    andConditions.push({
      OR: [
        {
          question: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
        {
          answer: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  const where = { AND: andConditions };

  const [faqs, total] = await Promise.all([
    prisma.fAQ.findMany({
      where,
      orderBy: {
        viewCount: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.fAQ.count({ where }),
  ]);

  return {
    faqs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const aiService = {
  createConversation,
  addMessage,
  getConversation,
  getUserConversations,
  processQuery,
  createFAQ,
  getFAQs,
};

export default aiService;

