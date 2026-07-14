import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const PLATFORM_SCHOOL_CODE = "WINFORGE-PLATFORM";

const getOrCreatePlatformSchool = async (userId) => {
  let school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Winforge Private Limited",
        code: PLATFORM_SCHOOL_CODE,
        address: ["Platform Office"],
        email: "finance@winforge.in",
        phone: "0000000000",
        createdBy: userId,
      },
    });
    logger.info({ schoolId: school.id }, "Platform school created");
  }
  return school;
};

const bootstrapPlatformAccounts = async (userId) => {
  const school = await getOrCreatePlatformSchool(userId);
  const existingAccounts = await prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null },
  });
  if (existingAccounts.length > 0) return existingAccounts;

  const accountsData = [
    { code: "1000", name: "Cash", type: "ASSET", parentCode: null, isGroup: false },
    { code: "1100", name: "Bank Account", type: "ASSET", parentCode: null, isGroup: false },
    { code: "1200", name: "Accounts Receivable", type: "ASSET", parentCode: null, isGroup: false },
    { code: "1300", name: "Platform Licenses", type: "ASSET", parentCode: null, isGroup: false },
    { code: "2000", name: "Accounts Payable", type: "LIABILITY", parentCode: null, isGroup: false },
    { code: "2100", name: "GST Payable", type: "LIABILITY", parentCode: null, isGroup: false },
    { code: "2200", name: "TDS Payable", type: "LIABILITY", parentCode: null, isGroup: false },
    { code: "3000", name: "Owner's Capital", type: "EQUITY", parentCode: null, isGroup: false },
    { code: "3100", name: "Retained Earnings", type: "EQUITY", parentCode: null, isGroup: false },
    { code: "4000", name: "Subscription Income", type: "INCOME", parentCode: null, isGroup: false },
    { code: "4100", name: "Onboarding Fees", type: "INCOME", parentCode: null, isGroup: false },
    { code: "4200", name: "Consulting Income", type: "INCOME", parentCode: null, isGroup: false },
    { code: "4300", name: "Other Platform Income", type: "INCOME", parentCode: null, isGroup: false },
    { code: "5000", name: "Salaries & Wages", type: "EXPENSE", parentCode: null, isGroup: false },
    { code: "5100", name: "Vendor Payments", type: "EXPENSE", parentCode: null, isGroup: false },
    { code: "5200", name: "Office Rent", type: "EXPENSE", parentCode: null, isGroup: false },
    { code: "5300", name: "Cloud & Hosting", type: "EXPENSE", parentCode: null, isGroup: false },
    { code: "5400", name: "Marketing & Advertising", type: "EXPENSE", parentCode: null, isGroup: false },
    { code: "5500", name: "Other Platform Expenses", type: "EXPENSE", parentCode: null, isGroup: false },
  ];

  const created = await prisma.account.createManyAndReturn({
    data: accountsData.map((a) => ({
      ...a,
      schoolId: school.id,
      createdBy: userId,
    })),
  });

  logger.info({ count: created.length }, "Platform chart of accounts bootstrapped");
  return created;
};

const listAccounts = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return [];

  return prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null },
    orderBy: { code: "asc" },
  });
};

const getTrialBalance = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return [];

  const accounts = await prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null },
    include: {
      lines: {
        where: { journalEntry: { deletedAt: null } },
      },
    },
  });

  return accounts.map((account) => {
    const totalDebit = account.lines.reduce((sum, l) => sum + Number(l.debitAmount), 0);
    const totalCredit = account.lines.reduce((sum, l) => sum + Number(l.creditAmount), 0);
    return {
      accountId: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit,
    };
  }).filter((a) => a.totalDebit !== 0 || a.totalCredit !== 0);
};

const createJournalEntry = async (data, userId) => {
  const school = await getOrCreatePlatformSchool(userId);
  const totalDebit = data.lines.reduce((sum, l) => sum + Number(l.debitAmount || 0), 0);
  const totalCredit = data.lines.reduce((sum, l) => sum + Number(l.creditAmount || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("Journal entry must be balanced (total debits = total credits)");
  }

  const entry = await prisma.journalEntry.create({
    data: {
      schoolId: school.id,
      entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
      reference: data.reference || null,
      narration: data.narration || null,
      createdBy: userId,
      lines: {
        create: data.lines.map((l) => ({
          accountId: l.accountId,
          debitAmount: l.debitAmount || 0,
          creditAmount: l.creditAmount || 0,
          lineDescription: l.lineDescription || null,
        })),
      },
    },
    include: { lines: { include: { account: true } } },
  });

  logger.info({ entryId: entry.id }, "Platform journal entry created");
  return entry;
};

const listJournalEntries = async (options = {}) => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return { entries: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { schoolId: school.id, deletedAt: null };

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { entryDate: "desc" },
      include: { lines: { include: { account: true } } },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return { entries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getProfitAndLoss = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return { income: [], expense: [], netProfit: 0 };

  const accounts = await prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null, type: { in: ["INCOME", "EXPENSE"] } },
    include: { lines: { where: { journalEntry: { deletedAt: null } } } },
  });

  const income = accounts
    .filter((a) => a.type === "INCOME")
    .map((a) => ({
      code: a.code,
      name: a.name,
      amount: a.lines.reduce((sum, l) => sum + Number(l.creditAmount) - Number(l.debitAmount), 0),
    }));

  const expense = accounts
    .filter((a) => a.type === "EXPENSE")
    .map((a) => ({
      code: a.code,
      name: a.name,
      amount: a.lines.reduce((sum, l) => sum + Number(l.debitAmount) - Number(l.creditAmount), 0),
    }));

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expense.reduce((sum, e) => sum + e.amount, 0);

  return { income, expense, totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
};

const getBalanceSheet = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return { assets: [], liabilities: [], equity: [] };

  const accounts = await prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null, type: { in: ["ASSET", "LIABILITY", "EQUITY"] } },
    include: { lines: { where: { journalEntry: { deletedAt: null } } } },
  });

  const mapAccount = (a) => ({
    code: a.code,
    name: a.name,
    balance: a.lines.reduce((sum, l) => {
      if (a.type === "ASSET") return sum + Number(l.debitAmount) - Number(l.creditAmount);
      return sum + Number(l.creditAmount) - Number(l.debitAmount);
    }, 0),
  });

  const assets = accounts.filter((a) => a.type === "ASSET").map(mapAccount);
  const liabilities = accounts.filter((a) => a.type === "LIABILITY").map(mapAccount);
  const equity = accounts.filter((a) => a.type === "EQUITY").map(mapAccount);

  return { assets, liabilities, equity };
};

const getOpeningBalances = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return [];

  return prisma.openingBalance.findMany({
    where: { schoolId: school.id, deletedAt: null },
    include: { account: true },
  });
};

const createOpeningBalance = async (data, userId) => {
  const school = await getOrCreatePlatformSchool(userId);

  const existing = await prisma.openingBalance.findFirst({
    where: { schoolId: school.id, accountId: data.accountId, deletedAt: null },
  });
  if (existing) {
    return prisma.openingBalance.update({
      where: { id: existing.id },
      data: { amount: data.amount, asOfDate: new Date(data.asOfDate || Date.now()), updatedBy: userId },
    });
  }

  return prisma.openingBalance.create({
    data: {
      schoolId: school.id,
      accountId: data.accountId,
      amount: data.amount,
      asOfDate: data.asOfDate ? new Date(data.asOfDate) : new Date(),
      createdBy: userId,
    },
  });
};

const getIncomingSummary = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return { total: 0, entries: [] };

  const incomeAccounts = await prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null, type: "INCOME" },
    include: { lines: { where: { journalEntry: { deletedAt: null } } } },
  });

  const entries = incomeAccounts.map((a) => ({
    code: a.code,
    name: a.name,
    amount: a.lines.reduce((sum, l) => sum + Number(l.creditAmount) - Number(l.debitAmount), 0),
  }));

  return { total: entries.reduce((sum, e) => sum + e.amount, 0), entries };
};

const getOutgoingSummary = async () => {
  const school = await prisma.school.findFirst({
    where: { code: PLATFORM_SCHOOL_CODE, deletedAt: null },
  });
  if (!school) return { total: 0, entries: [] };

  const expenseAccounts = await prisma.account.findMany({
    where: { schoolId: school.id, deletedAt: null, type: "EXPENSE" },
    include: { lines: { where: { journalEntry: { deletedAt: null } } } },
  });

  const entries = expenseAccounts.map((a) => ({
    code: a.code,
    name: a.name,
    amount: a.lines.reduce((sum, l) => sum + Number(l.debitAmount) - Number(l.creditAmount), 0),
  }));

  return { total: entries.reduce((sum, e) => sum + e.amount, 0), entries };
};

const platformFinanceService = {
  getOrCreatePlatformSchool,
  bootstrapPlatformAccounts,
  listAccounts,
  getTrialBalance,
  createJournalEntry,
  listJournalEntries,
  getProfitAndLoss,
  getBalanceSheet,
  getOpeningBalances,
  createOpeningBalance,
  getIncomingSummary,
  getOutgoingSummary,
};

export default platformFinanceService;
