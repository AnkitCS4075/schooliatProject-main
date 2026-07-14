import { Router } from "express";
import platformFinanceService from "../services/platform-finance.service.js";

const router = Router();

router.post("/bootstrap", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const accounts = await platformFinanceService.bootstrapPlatformAccounts(userId);
    res.json({ status: 200, data: accounts });
  } catch (error) {
    next(error);
  }
});

router.get("/accounts", async (req, res, next) => {
  try {
    const accounts = await platformFinanceService.listAccounts();
    res.json({ status: 200, data: accounts });
  } catch (error) {
    next(error);
  }
});

router.get("/balances", async (req, res, next) => {
  try {
    const balances = await platformFinanceService.getTrialBalance();
    res.json({ status: 200, data: balances });
  } catch (error) {
    next(error);
  }
});

router.get("/journal-entries", async (req, res, next) => {
  try {
    const result = await platformFinanceService.listJournalEntries(req.query);
    res.json({ status: 200, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/journal-entries", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const data = req.body.request || req.body;
    const entry = await platformFinanceService.createJournalEntry(data, userId);
    res.status(201).json({ status: 201, data: entry });
  } catch (error) {
    next(error);
  }
});

router.get("/reports/profit-and-loss", async (req, res, next) => {
  try {
    const report = await platformFinanceService.getProfitAndLoss();
    res.json({ status: 200, data: report });
  } catch (error) {
    next(error);
  }
});

router.get("/reports/balance-sheet", async (req, res, next) => {
  try {
    const report = await platformFinanceService.getBalanceSheet();
    res.json({ status: 200, data: report });
  } catch (error) {
    next(error);
  }
});

router.get("/opening-balances", async (req, res, next) => {
  try {
    const balances = await platformFinanceService.getOpeningBalances();
    res.json({ status: 200, data: balances });
  } catch (error) {
    next(error);
  }
});

router.post("/opening-balances", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const data = req.body.request || req.body;
    const balance = await platformFinanceService.createOpeningBalance(data, userId);
    res.status(201).json({ status: 201, data: balance });
  } catch (error) {
    next(error);
  }
});

router.get("/incoming", async (req, res, next) => {
  try {
    const summary = await platformFinanceService.getIncomingSummary();
    res.json({ status: 200, data: summary });
  } catch (error) {
    next(error);
  }
});

router.get("/outgoing", async (req, res, next) => {
  try {
    const summary = await platformFinanceService.getOutgoingSummary();
    res.json({ status: 200, data: summary });
  } catch (error) {
    next(error);
  }
});

export default router;
