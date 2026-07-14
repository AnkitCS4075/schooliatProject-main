import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import libraryService from "../services/library.service.js";
import createBookSchema from "../schemas/library/create-book.schema.js";
import updateBookSchema from "../schemas/library/update-book.schema.js";
import issueBookSchema from "../schemas/library/issue-book.schema.js";
import returnBookSchema from "../schemas/library/return-book.schema.js";
import reserveBookSchema from "../schemas/library/reserve-book.schema.js";
import getBooksSchema from "../schemas/library/get-books.schema.js";
import getBookByIdSchema from "../schemas/library/get-book-by-id.schema.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import getHistorySchema from "../schemas/library/get-history.schema.js";

const router = Router();

// Create book
router.post(
  "/books",
  withPermission(Permission.CREATE_LIBRARY_BOOK),
  validateRequest(createBookSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const book = await libraryService.createBook({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Book created successfully",
        data: book,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to create book",
      });
    }
  },
);

// Bulk create books
router.post(
  "/books/bulk",
  withPermission(Permission.CREATE_LIBRARY_BOOK),
  async (req, res) => {
    try {
      const { books } = req.body.request;
      const currentUser = req.context.user;

      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({
          message: "Please provide an array of books",
        });
      }

      const createdBooks = await prisma.libraryBook.createMany({
        data: books.map((book) => ({
          title: book.title,
          author: book.author,
          isbn: book.isbn || null,
          publisher: book.publisher || null,
          category: book.category || null,
          description: book.description || null,
          totalCopies: book.totalCopies ? parseInt(book.totalCopies) : 1,
          availableCopies: book.totalCopies ? parseInt(book.totalCopies) : 1,
          location: book.location || null,
          language: book.language || "English",
          publishedYear: book.publishedYear ? parseInt(book.publishedYear) : null,
          schoolId: currentUser.schoolId,
          createdBy: currentUser.id,
        })),
        skipDuplicates: true,
      });

      return res.status(201).json({
        message: `${createdBooks.count} books created successfully`,
        data: { count: createdBooks.count },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk create books",
      });
    }
  },
);

// Update book
router.put(
  "/books/:id",
  withPermission(Permission.EDIT_LIBRARY_BOOK),
  validateRequest(updateBookSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const book = await libraryService.updateBook(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Book updated successfully",
        data: book,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to update book",
      });
    }
  },
);

// Get single book
router.get(
  "/books/:id",
  withPermission(Permission.GET_LIBRARY_BOOKS),
  validateRequest(getBookByIdSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const book = await libraryService.getBookById(currentUser.schoolId, id);
      if (!book) {
        return res.status(404).json({
          message: "Book not found",
        });
      }

      return res.status(200).json({
        message: "Book fetched successfully",
        data: book,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch book",
      });
    }
  },
);

// Get books (search)
router.get(
  "/books",
  withPermission(Permission.GET_LIBRARY_BOOKS),
  validateRequest(getBooksSchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const result = await libraryService.searchBooks(
        currentUser.schoolId,
        {
          title: query.title,
          author: query.author,
          category: query.category,
          isbn: query.isbn,
        },
        {
          page: query.page,
          limit: query.limit,
        },
      );

      return res.status(200).json({
        message: "Books fetched successfully",
        data: result.books,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch books",
      });
    }
  },
);

// Delete book (soft delete)
router.delete(
  "/books/:id",
  withPermission(Permission.EDIT_LIBRARY_BOOK),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "LibraryBook" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const book = await libraryService.getBookById(currentUser.schoolId, id);
      if (!book) {
        return res.status(404).json({
          message: "Book not found",
        });
      }

      await libraryService.deleteBook(id, currentUser.id);

      return res.status(200).json({
        message: "Book deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to delete book",
      });
    }
  },
);

// Issue book
router.post(
  "/issues",
  withPermission(Permission.ISSUE_LIBRARY_BOOK),
  validateRequest(issueBookSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const issue = await libraryService.issueBook({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Book issued successfully",
        data: issue,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to issue book",
      });
    }
  },
);

// Return book
router.post(
  "/issues/:id/return",
  withPermission(Permission.RETURN_LIBRARY_BOOK),
  validateRequest(returnBookSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = req.body.request;
      const currentUser = req.context.user;

      const issue = await libraryService.returnBook(id, {
        ...request,
        updatedBy: currentUser.id,
      });

      return res.status(200).json({
        message: "Book returned successfully",
        data: issue,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to return book",
      });
    }
  },
);

// Reserve book
router.post(
  "/reservations",
  withPermission(Permission.RESERVE_LIBRARY_BOOK),
  validateRequest(reserveBookSchema),
  async (req, res) => {
    try {
      const request = req.body.request;
      const currentUser = req.context.user;

      const reservation = await libraryService.reserveBook({
        ...request,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      return res.status(201).json({
        message: "Book reserved successfully",
        data: reservation,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to reserve book",
      });
    }
  },
);

// Get library history (school-wide when userId not provided and user has schoolId)
router.get(
  "/history",
  withPermission(Permission.GET_LIBRARY_HISTORY),
  validateRequest(getHistorySchema),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const options = {
        page: query.page,
        limit: query.limit,
        status: query.status,
      };

      const result =
        query.userId != null && query.userId !== ""
          ? await libraryService.getUserHistory(query.userId, options)
          : currentUser.schoolId
            ? await libraryService.getSchoolHistory(currentUser.schoolId, options)
            : await libraryService.getUserHistory(currentUser.id, options);

      return res.status(200).json({
        message: "Library history fetched successfully",
        data: result.issues,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch library history",
      });
    }
  },
);

// Get pending returns (all ISSUED/OVERDUE for school)
router.get(
  "/pending-returns",
  withPermission(Permission.GET_LIBRARY_HISTORY),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      if (!currentUser.schoolId) {
        return res.status(200).json({
          message: "Pending returns fetched successfully",
          data: [],
        });
      }

      const issues = await libraryService.getPendingReturns(currentUser.schoolId);

      return res.status(200).json({
        message: "Pending returns fetched successfully",
        data: issues,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch pending returns",
      });
    }
  },
);

// Librarian dashboard
router.get(
  "/dashboard",
  withPermission(Permission.GET_LIBRARY_BOOKS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      const dashboard = await libraryService.getLibrarianDashboard(
        currentUser.schoolId,
      );

      return res.status(200).json({
        message: "Dashboard data fetched successfully",
        data: dashboard,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch dashboard data",
      });
    }
  },
);

// Calculate overdue fines (admin only)
router.post(
  "/calculate-fines",
  withPermission(Permission.GET_LIBRARY_BOOKS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;

      const result = await libraryService.calculateOverdueFines(
        currentUser.schoolId,
      );

      return res.status(200).json({
        message: "Fines calculated successfully",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to calculate fines",
      });
    }
  },
);

export default router;

