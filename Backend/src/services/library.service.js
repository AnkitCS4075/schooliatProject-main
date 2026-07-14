import prisma from "../prisma/client.js";
import pkg from "../prisma/generated/index.js";
const { LibraryIssueStatus } = pkg || {};
import { parsePagination } from "../utils/pagination.util.js";

// Fallback if LibraryIssueStatus enum doesn't exist
const IssueStatusEnum = LibraryIssueStatus || {
  ISSUED: "ISSUED",
  RETURNED: "RETURNED",
  OVERDUE: "OVERDUE",
};
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";

/**
 * Create library book
 * @param {Object} data - Book data
 * @returns {Promise<Object>} - Created book
 */
const createBook = async (data) => {
  const {
    title,
    author,
    isbn = null,
    publisher = null,
    category = null,
    description = null,
    totalCopies = 1,
    location = null,
    price = null,
    language = "English",
    publishedYear = null,
    schoolId,
    createdBy,
  } = data;

  const book = await prisma.libraryBook.create({
    data: {
      title,
      author,
      isbn,
      publisher,
      category,
      description,
      totalCopies,
      availableCopies: totalCopies,
      location,
      price,
      language,
      publishedYear,
      schoolId,
      createdBy,
    },
  });

  return book;
};

/**
 * Get single book by id (must belong to school)
 * @param {string} schoolId - School ID
 * @param {string} bookId - Book ID
 * @returns {Promise<Object|null>} - Book or null
 */
const getBookById = async (schoolId, bookId) => {
  if (!schoolId || !bookId) return null;
  const book = await prisma.libraryBook.findFirst({
    where: { id: bookId, schoolId, deletedAt: null },
  });
  return book;
};

/**
 * Soft-delete library book
 * @param {string} bookId - Book ID
 * @param {string} deletedBy - User ID
 * @returns {Promise<Object>} - Updated book
 */
const deleteBook = async (bookId, deletedBy) => {
  const book = await prisma.libraryBook.findUnique({
    where: { id: bookId },
  });
  if (!book) throw new Error("Book not found");
  return prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });
};

/**
 * Update library book
 * @param {string} bookId - Book ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated book
 */
const updateBook = async (bookId, data) => {
  const updateData = { ...data };
  delete updateData.bookId;

  // If totalCopies is updated, adjust availableCopies
  if (updateData.totalCopies !== undefined) {
    const currentBook = await prisma.libraryBook.findUnique({
      where: { id: bookId },
    });

    if (currentBook) {
      const difference = updateData.totalCopies - currentBook.totalCopies;
      updateData.availableCopies = Math.max(0, currentBook.availableCopies + difference);
    }
  }

  const book = await prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      ...updateData,
      updatedBy: data.updatedBy,
    },
  });

  return book;
};

/**
 * Issue book to user
 * @param {Object} data - Issue data
 * @returns {Promise<Object>} - Created issue
 */
const issueBook = async (data) => {
  const {
    bookId,
    userId,
    dueDate,
    schoolId,
    createdBy,
  } = data;

  // Check book availability
  const book = await prisma.libraryBook.findUnique({
    where: { id: bookId },
  });

  if (!book || book.availableCopies < 1) {
    throw new Error("Book not available");
  }

  // Check if user has any overdue books
  const overdueIssues = await prisma.libraryIssue.findMany({
    where: {
      userId,
      status: IssueStatusEnum.OVERDUE,
      deletedAt: null,
    },
  });

  if (overdueIssues.length > 0) {
    throw new Error("User has overdue books. Please return them first.");
  }

  // Create issue
  const issue = await prisma.libraryIssue.create({
    data: {
      bookId,
      userId,
      issuedDate: new Date(),
      dueDate: new Date(dueDate),
      status: IssueStatusEnum.ISSUED,
      schoolId,
      createdBy,
    },
  });

  // Update book availability
  await prisma.libraryBook.update({
    where: { id: bookId },
    data: {
      availableCopies: {
        decrement: 1,
      },
    },
  });

  return issue;
};

/**
 * Return book
 * @param {string} issueId - Issue ID
 * @param {Object} data - Return data
 * @returns {Promise<Object>} - Updated issue
 */
const returnBook = async (issueId, data) => {
  const { remarks = null, updatedBy } = data;

  const issue = await prisma.libraryIssue.findUnique({
    where: { id: issueId },
    include: { book: true },
  });

  if (!issue || issue.status === IssueStatusEnum.RETURNED) {
    throw new Error("Issue not found or already returned");
  }

  const returnDate = new Date();
  const isOverdue = returnDate > issue.dueDate;

  // Calculate fine if overdue (example: 5 per day)
  let fineAmount = 0;
  if (isOverdue) {
    const daysOverdue = Math.ceil((returnDate - issue.dueDate) / (1000 * 60 * 60 * 24));
    fineAmount = daysOverdue * 5; // 5 per day
  }

  // Update issue
  const updatedIssue = await prisma.libraryIssue.update({
    where: { id: issueId },
    data: {
      returnDate,
      status: IssueStatusEnum.RETURNED,
      fineAmount,
      remarks,
      updatedBy,
    },
  });

  // Update book availability
  await prisma.libraryBook.update({
    where: { id: issue.bookId },
    data: {
      availableCopies: {
        increment: 1,
      },
    },
  });

  return updatedIssue;
};

/**
 * Reserve book
 * @param {Object} data - Reservation data
 * @returns {Promise<Object>} - Created reservation
 */
const reserveBook = async (data) => {
  const {
    bookId,
    userId,
    expiresAt,
    schoolId,
    createdBy,
  } = data;

  // Check if already reserved by this user
  const existingReservation = await prisma.libraryReservation.findFirst({
    where: {
      bookId,
      userId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (existingReservation) {
    throw new Error("Book already reserved by this user");
  }

  const reservation = await prisma.libraryReservation.create({
    data: {
      bookId,
      userId,
      expiresAt: new Date(expiresAt),
      schoolId,
      createdBy,
    },
  });

  return reservation;
};

/**
 * Get library history for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - History with pagination
 */
const getUserHistory = async (userId, options = {}) => {
  const { page, limit, skip } = parsePagination(options);
  const { status = null } = options;

  const where = {
    userId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const [issues, total] = await Promise.all([
    prisma.libraryIssue.findMany({
      where,
      include: {
        book: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { issuedDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.libraryIssue.count({ where }),
  ]);

  return {
    issues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get library history for entire school (all issues)
 * @param {string} schoolId - School ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - History with pagination
 */
const getSchoolHistory = async (schoolId, options = {}) => {
  const { page, limit, skip } = parsePagination(options);
  const { status = null } = options;

  if (!schoolId) {
    return {
      issues: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  const where = {
    schoolId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const [issues, total] = await Promise.all([
    prisma.libraryIssue.findMany({
      where,
      include: {
        book: true,
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { issuedDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.libraryIssue.count({ where }),
  ]);

  return {
    issues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all pending returns (ISSUED or OVERDUE) for the school
 * @param {string} schoolId - School ID
 * @returns {Promise<Array>} - Issues with book and user
 */
const getPendingReturns = async (schoolId) => {
  if (!schoolId) return [];

  const issues = await prisma.libraryIssue.findMany({
    where: {
      schoolId,
      deletedAt: null,
      status: { in: [IssueStatusEnum.ISSUED, IssueStatusEnum.OVERDUE] },
    },
    include: {
      book: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return issues.map((issue) => ({
    ...issue,
    borrowerName: [issue.user?.firstName, issue.user?.lastName].filter(Boolean).join(" ").trim() || issue.userId,
  }));
};

/**
 * Search books
 * @param {string} schoolId - School ID
 * @param {Object} filters - Search filters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Books with pagination
 */
const searchBooks = async (schoolId, filters = {}, options = {}) => {
  const { page, limit, skip } = parsePagination(options);

  if (!schoolId) {
    return {
      books: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  const where = {
    schoolId,
    deletedAt: null,
  };

  if (filters.title) {
    where.title = {
      contains: filters.title,
      mode: "insensitive",
    };
  }

  if (filters.author) {
    where.author = {
      contains: filters.author,
      mode: "insensitive",
    };
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.isbn) {
    where.isbn = filters.isbn;
  }

  try {
    const [books, total] = await Promise.all([
      prisma.libraryBook.findMany({
        where,
        orderBy: { title: "asc" },
        skip,
        take: limit,
      }),
      prisma.libraryBook.count({ where }),
    ]);
    return {
      books,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (err) {
    logger.warn({ err: err.message, schoolId }, "library searchBooks failed");
    return {
      books: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }
};

/**
 * Calculate and update overdue fines
 * @param {string} schoolId - School ID
 * @returns {Promise<Object>} - Update result
 */
const calculateOverdueFines = async (schoolId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all issued books past due date
  const overdueIssues = await prisma.libraryIssue.findMany({
    where: {
      schoolId,
      status: IssueStatusEnum.ISSUED,
      dueDate: {
        lt: today,
      },
      deletedAt: null,
    },
    include: { book: true },
  });

  let updatedCount = 0;
  for (const issue of overdueIssues) {
    const daysOverdue = Math.ceil((today - issue.dueDate) / (1000 * 60 * 60 * 24));
    const fineAmount = daysOverdue * 5; // 5 per day

    await prisma.libraryIssue.update({
      where: { id: issue.id },
      data: {
        status: IssueStatusEnum.OVERDUE,
        fineAmount,
      },
    });

    updatedCount++;

    // Send notification to user
    await notificationService.createNotification({
      userId: issue.userId,
      title: "Library Book Overdue",
      content: `Your book "${issue.book?.title || "Book"}" is overdue. Fine: ₹${fineAmount}`,
      type: "LIBRARY",
      actionUrl: `/library/history`,
      schoolId,
      createdBy: "system",
    });
  }

  return {
    updatedCount,
    totalOverdue: overdueIssues.length,
  };
};

/**
 * Get librarian dashboard data
 * @param {string} schoolId - School ID
 * @returns {Promise<Object>} - Dashboard statistics
 */
const getLibrarianDashboard = async (schoolId) => {
  if (!schoolId) {
    return {
      totalBooks: 0,
      availableBooks: 0,
      issuedBooks: 0,
      overdueBooks: 0,
      pendingReservations: 0,
      totalIssues: 0,
    };
  }

  const [
    totalBooks,
    availableBooks,
    issuedBooks,
    overdueBooks,
    pendingReservations,
    totalIssues,
  ] = await Promise.all([
    prisma.libraryBook.count({
      where: {
        schoolId,
        deletedAt: null,
      },
    }),
    prisma.libraryBook.aggregate({
      where: {
        schoolId,
        deletedAt: null,
      },
      _sum: {
        availableCopies: true,
      },
    }),
    prisma.libraryIssue.count({
      where: {
        schoolId,
        status: IssueStatusEnum.ISSUED,
        deletedAt: null,
      },
    }),
    prisma.libraryIssue.count({
      where: {
        schoolId,
        status: IssueStatusEnum.OVERDUE,
        deletedAt: null,
      },
    }),
    prisma.libraryReservation.count({
      where: {
        schoolId,
        isActive: true,
        deletedAt: null,
      },
    }),
    prisma.libraryIssue.count({
      where: {
        schoolId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    totalBooks,
    availableBooks: availableBooks._sum.availableCopies || 0,
    issuedBooks,
    overdueBooks,
    pendingReservations,
    totalIssues,
  };
};

const libraryService = {
  createBook,
  updateBook,
  getBookById,
  deleteBook,
  issueBook,
  returnBook,
  reserveBook,
  getUserHistory,
  getSchoolHistory,
  getPendingReturns,
  searchBooks,
  calculateOverdueFines,
  getLibrarianDashboard,
};

export default libraryService;

