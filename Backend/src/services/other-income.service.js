import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const create = async ({ schoolId, title, description, amount, category, source, receivedAt, receivedBy, attachmentId, createdBy }) => {
  const income = await prisma.otherIncome.create({
    data: {
      schoolId,
      title,
      description: description || null,
      amount: parseFloat(amount),
      category: category || null,
      source: source || null,
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      receivedBy,
      attachmentId: attachmentId || null,
      createdBy,
    },
  });
  logger.info({ incomeId: income.id, schoolId }, "Other income created");
  return income;
};

const list = async ({ schoolId, page = 1, limit = 20, category, dateFrom, dateTo }) => {
  const skip = (page - 1) * limit;
  const where = { schoolId, deletedAt: null };
  if (category) where.category = category;
  if (dateFrom || dateTo) {
    where.receivedAt = {};
    if (dateFrom) where.receivedAt.gte = new Date(dateFrom);
    if (dateTo) where.receivedAt.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    prisma.otherIncome.findMany({
      where,
      skip,
      take: limit,
      orderBy: { receivedAt: "desc" },
      include: {
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.otherIncome.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getById = async (id, schoolId) => {
  return prisma.otherIncome.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: {
      receiver: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

const update = async (id, schoolId, data, updatedBy) => {
  const income = await prisma.otherIncome.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.amount && { amount: parseFloat(data.amount) }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.receivedAt && { receivedAt: new Date(data.receivedAt) }),
      updatedBy,
    },
  });
  logger.info({ incomeId: id }, "Other income updated");
  return income;
};

const remove = async (id, schoolId, deletedBy) => {
  await prisma.otherIncome.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
  });
  logger.info({ incomeId: id }, "Other income soft-deleted");
};

const getSummary = async (schoolId, dateFrom, dateTo) => {
  const where = { schoolId, deletedAt: null };
  if (dateFrom || dateTo) {
    where.receivedAt = {};
    if (dateFrom) where.receivedAt.gte = new Date(dateFrom);
    if (dateTo) where.receivedAt.lte = new Date(dateTo);
  }

  const result = await prisma.otherIncome.aggregate({
    where,
    _sum: { amount: true },
    _count: true,
  });

  return {
    totalAmount: Number(result._sum.amount || 0),
    count: result._count,
  };
};

const otherIncomeService = { create, list, getById, update, remove, getSummary };
export default otherIncomeService;
