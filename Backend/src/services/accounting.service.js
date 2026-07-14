import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const DEFAULT_ACCOUNTS = [
  { code: "1000", name: "Cash", type: "ASSET" },
  { code: "1100", name: "Bank Account", type: "ASSET" },
  { code: "1200", name: "Accounts Receivable", type: "ASSET" },
  { code: "1300", name: "Fixed Assets", type: "ASSET" },
  { code: "2000", name: "Accounts Payable", type: "LIABILITY" },
  { code: "2100", name: "Loan Payable", type: "LIABILITY" },
  { code: "2200", name: "Student Fee Liability", type: "LIABILITY" },
  { code: "3000", name: "Capital", type: "EQUITY" },
  { code: "3100", name: "Retained Earnings", type: "EQUITY" },
  { code: "4000", name: "Fee Income", type: "INCOME" },
  { code: "4100", name: "Other Income", type: "INCOME" },
  { code: "4200", name: "Donation Income", type: "INCOME" },
  { code: "5000", name: "Salary Expense", type: "EXPENSE" },
  { code: "5100", name: "Electricity Expense", type: "EXPENSE" },
  { code: "5200", name: "Maintenance Expense", type: "EXPENSE" },
  { code: "5300", name: "Transport Expense", type: "EXPENSE" },
  { code: "5400", name: "Office Supplies", type: "EXPENSE" },
];

const bootstrapChartOfAccounts = async (schoolId, createdBy) => {
  const existing = await prisma.account.count({ where: { schoolId, deletedAt: null } });
  if (existing > 0) return existing;

  const accounts = DEFAULT_ACCOUNTS.map((a) => ({
    schoolId,
    code: a.code,
    name: a.name,
    type: a.type,
    createdBy,
  }));

  await prisma.account.createMany({ data: accounts });
  logger.info({ schoolId, count: accounts.length }, "Chart of accounts bootstrapped");
  return accounts.length;
};

const getAccounts = async (schoolId) => {
  return prisma.account.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { code: "asc" },
  });
};

const createAccount = async (schoolId, data, createdBy) => {
  return prisma.account.create({
    data: {
      schoolId,
      code: data.code,
      name: data.name,
      type: data.type,
      parentCode: data.parentCode || null,
      isGroup: data.isGroup || false,
      createdBy,
    },
  });
};

const createJournalEntry = async (schoolId, { entryDate, reference, narration, lines }, createdBy) => {
  const totalDebit = lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Journal entry must balance: debit ${totalDebit} != credit ${totalCredit}`);
  }

  return prisma.$transaction(async (tx) => {
    const entry = await tx.journalEntry.create({
      data: {
        schoolId,
        entryDate: new Date(entryDate),
        reference: reference || null,
        narration: narration || null,
        createdBy,
      },
    });

    await tx.journalEntryLine.createMany({
      data: lines.map((l) => ({
        journalEntryId: entry.id,
        accountId: l.accountId,
        debitAmount: parseFloat(l.debitAmount || 0),
        creditAmount: parseFloat(l.creditAmount || 0),
        lineDescription: l.lineDescription || null,
      })),
    });

    logger.info({ entryId: entry.id, schoolId }, "Journal entry created");
    return entry;
  });
};

const getJournalEntries = async (schoolId, { page = 1, limit = 20, dateFrom, dateTo } = {}) => {
  const skip = (page - 1) * limit;
  const where = { schoolId, deletedAt: null };
  if (dateFrom || dateTo) {
    where.entryDate = {};
    if (dateFrom) where.entryDate.gte = new Date(dateFrom);
    if (dateTo) where.entryDate.lte = new Date(dateTo);
  }

  const [entries, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { entryDate: "desc" },
      include: {
        lines: {
          include: { account: { select: { code: true, name: true } } },
        },
      },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return { entries, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getAccountBalances = async (schoolId) => {
  const accounts = await prisma.account.findMany({
    where: { schoolId, deletedAt: null, isGroup: false },
    orderBy: { code: "asc" },
  });

  const openingBalances = await prisma.openingBalance.findMany({
    where: { schoolId, deletedAt: null },
  });
  const obMap = {};
  for (const ob of openingBalances) {
    obMap[ob.accountId] = Number(ob.amount);
  }

  const lines = await prisma.journalEntryLine.findMany({
    where: { journalEntry: { schoolId, deletedAt: null } },
    include: { account: { select: { id: true, code: true, name: true, type: true } } },
  });

  const balances = {};
  for (const account of accounts) {
    balances[account.id] = {
      code: account.code,
      name: account.name,
      type: account.type,
      debit: 0,
      credit: 0,
      openingBalance: obMap[account.id] || 0,
    };
  }

  for (const line of lines) {
    if (!balances[line.accountId]) continue;
    balances[line.accountId].debit += Number(line.debitAmount);
    balances[line.accountId].credit += Number(line.creditAmount);
  }

  return Object.values(balances).map((b) => ({
    ...b,
    closingBalance: b.openingBalance + b.debit - b.credit,
  }));
};

const getProfitAndLoss = async (schoolId, dateFrom, dateTo) => {
  const balances = await getAccountBalances(schoolId);
  const incomeAccounts = balances.filter((b) => b.type === "INCOME");
  const expenseAccounts = balances.filter((b) => b.type === "EXPENSE");

  const totalIncome = incomeAccounts.reduce((s, b) => s + (b.credit - b.debit), 0);
  const totalExpense = expenseAccounts.reduce((s, b) => s + (b.debit - b.credit), 0);

  return {
    income: incomeAccounts.map((b) => ({ ...b, amount: b.credit - b.debit })),
    expense: expenseAccounts.map((b) => ({ ...b, amount: b.debit - b.credit })),
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
  };
};

const getBalanceSheet = async (schoolId) => {
  const balances = await getAccountBalances(schoolId);
  const assetAccounts = balances.filter((b) => b.type === "ASSET");
  const liabilityAccounts = balances.filter((b) => b.type === "LIABILITY");
  const equityAccounts = balances.filter((b) => b.type === "EQUITY");

  const totalAssets = assetAccounts.reduce((s, b) => s + b.closingBalance, 0);
  const totalLiabilities = liabilityAccounts.reduce((s, b) => s + b.closingBalance, 0);
  const totalEquity = equityAccounts.reduce((s, b) => s + b.closingBalance, 0);

  return {
    assets: assetAccounts.map((b) => ({ ...b, amount: b.closingBalance })),
    liabilities: liabilityAccounts.map((b) => ({ ...b, amount: b.closingBalance })),
    equity: equityAccounts.map((b) => ({ ...b, amount: b.closingBalance })),
    totalAssets,
    totalLiabilities,
    totalEquity,
  };
};

const upsertOpeningBalance = async (schoolId, accountId, amount, asOfDate, createdBy) => {
  return prisma.openingBalance.upsert({
    where: { schoolId_accountId: { schoolId, accountId } },
    update: { amount: parseFloat(amount), asOfDate: new Date(asOfDate), updatedBy: createdBy },
    create: { schoolId, accountId, amount: parseFloat(amount), asOfDate: new Date(asOfDate), createdBy },
  });
};

const accountingService = {
  bootstrapChartOfAccounts,
  getAccounts,
  createAccount,
  createJournalEntry,
  getJournalEntries,
  getAccountBalances,
  getProfitAndLoss,
  getBalanceSheet,
  upsertOpeningBalance,
};

export default accountingService;
