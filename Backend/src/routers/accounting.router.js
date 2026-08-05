import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import accountingService from "../services/accounting.service.js";
import logger from "../config/logger.js";

const router = Router();

// Resolve effective school: school-scoped users use their JWT schoolId;
// platform users (super admin) must explicitly pass ?schoolId= (GET) or request.schoolId (POST).
const resolveSchoolId = (req) => {
  const currentUser = req.context.user;
  if (currentUser.schoolId) return currentUser.schoolId;
  const requested = req.query.schoolId ?? req.body?.request?.schoolId;
  if (!requested) {
    throw new Error("School context required: specify ?schoolId= (GET) or request.schoolId (POST)");
  }
  return requested;
};

// Bootstrap chart of accounts for school
router.post(
  "/bootstrap",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const count = await accountingService.bootstrapChartOfAccounts(resolveSchoolId(req), currentUser.id);
      return res.json({ message: `Chart of accounts ready (${count} accounts)`, data: { count } });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to bootstrap accounts" });
    }
  }
);

// List all accounts
router.get(
  "/accounts",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const accounts = await accountingService.getAccounts(resolveSchoolId(req));
      return res.json({ message: "Accounts retrieved", data: accounts });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get accounts" });
    }
  }
);

// Create a new account
router.post(
  "/accounts",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const account = await accountingService.createAccount(resolveSchoolId(req), req.body.request, currentUser.id);
      return res.status(201).json({ message: "Account created", data: account });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to create account" });
    }
  }
);

// Create journal entry (double-entry)
router.post(
  "/journal-entries",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const entry = await accountingService.createJournalEntry(
        resolveSchoolId(req),
        req.body.request,
        currentUser.id,
      );
      return res.status(201).json({ message: "Journal entry created", data: entry });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to create journal entry" });
    }
  }
);

// List journal entries
router.get(
  "/journal-entries",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { page, limit, dateFrom, dateTo } = req.query;
      const result = await accountingService.getJournalEntries(resolveSchoolId(req), {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        dateFrom,
        dateTo,
      });
      return res.json({ message: "Journal entries retrieved", data: result.entries, pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get journal entries" });
    }
  }
);

// Get account balances (trial balance)
router.get(
  "/balances",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const balances = await accountingService.getAccountBalances(resolveSchoolId(req));
      return res.json({ message: "Account balances retrieved", data: balances });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get balances" });
    }
  }
);

// Get P&L report
router.get(
  "/reports/profit-and-loss",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { dateFrom, dateTo } = req.query;
      const report = await accountingService.getProfitAndLoss(resolveSchoolId(req), dateFrom, dateTo);
      return res.json({ message: "P&L report generated", data: report });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to generate P&L" });
    }
  }
);

// Get Balance Sheet
router.get(
  "/reports/balance-sheet",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const report = await accountingService.getBalanceSheet(resolveSchoolId(req));
      return res.json({ message: "Balance sheet generated", data: report });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to generate balance sheet" });
    }
  }
);

// Upsert opening balance
router.post(
  "/opening-balances",
  withPermission([Permission.EDIT_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { accountId, amount, asOfDate } = req.body.request;
      const ob = await accountingService.upsertOpeningBalance(resolveSchoolId(req), accountId, amount, asOfDate, currentUser.id);
      return res.json({ message: "Opening balance saved", data: ob });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to save opening balance" });
    }
  }
);

// Get opening balances
router.get(
  "/opening-balances",
  withPermission([Permission.GET_SETTINGS]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const prisma = (await import("../prisma/client.js")).default;
      const obs = await prisma.openingBalance.findMany({
        where: { schoolId: resolveSchoolId(req), deletedAt: null },
        include: { account: { select: { code: true, name: true } } },
      });
      return res.json({ message: "Opening balances retrieved", data: obs });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get opening balances" });
    }
  }
);

export default router;
