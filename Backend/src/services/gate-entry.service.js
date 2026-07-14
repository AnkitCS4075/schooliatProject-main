import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const create = async (data, schoolId, userId) => {
  try {
    const lastEntry = await prisma.gateEntry.findFirst({
      where: { schoolId },
      orderBy: { serialNo: "desc" },
      select: { serialNo: true },
    });
    const serialNo = (lastEntry?.serialNo || 0) + 1;

    const entry = await prisma.gateEntry.create({
      data: {
        serialNo,
        category: data.category,
        name: data.name,
        phone: data.phone,
        reason: data.reason || null,
        personToMeet: data.personToMeet || null,
        photoFileId: data.photoFileId || null,
        schoolId,
        createdBy: userId,
      },
    });

    let linkedLead = null;
    if (data.category === "ADMISSION_ENQUIRY") {
      linkedLead = await prisma.crmLead.create({
        data: {
          name: data.name,
          phone: data.phone,
          source: "GATE_ENTRY",
          stage: "NEW",
          category: "Admission Enquiry",
          schoolId,
          createdBy: userId,
        },
      });
      await prisma.gateEntry.update({
        where: { id: entry.id },
        data: { linkedLeadId: linkedLead.id },
      });
    }

    return { ...entry, linkedLead };
  } catch (error) {
    logger.error({ error: error.message }, "Failed to create gate entry");
    throw error;
  }
};

const getById = async (id, schoolId) => {
  const entry = await prisma.gateEntry.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: { linkedLead: true, creator: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!entry) throw new Error("Gate entry not found");
  return entry;
};

const list = async (schoolId, filters = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { schoolId, deletedAt: null };
  if (filters.category) where.category = filters.category;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.startDate || filters.endDate) {
    where.inTime = {};
    if (filters.startDate) where.inTime.gte = new Date(filters.startDate);
    if (filters.endDate) where.inTime.lte = new Date(filters.endDate);
  }

  const [entries, total] = await Promise.all([
    prisma.gateEntry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { inTime: "desc" },
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.gateEntry.count({ where }),
  ]);

  return { entries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const update = async (id, data, schoolId) => {
  const existing = await prisma.gateEntry.findFirst({ where: { id, schoolId, deletedAt: null } });
  if (!existing) throw new Error("Gate entry not found");

  const updateData = {};
  if (data.outTime !== undefined) updateData.outTime = data.outTime;
  if (data.reason !== undefined) updateData.reason = data.reason;
  if (data.personToMeet !== undefined) updateData.personToMeet = data.personToMeet;
  if (data.photoFileId !== undefined) updateData.photoFileId = data.photoFileId;

  return prisma.gateEntry.update({ where: { id }, data: updateData });
};

const remove = async (id, schoolId, userId) => {
  const existing = await prisma.gateEntry.findFirst({ where: { id, schoolId, deletedAt: null } });
  if (!existing) throw new Error("Gate entry not found");
  return prisma.gateEntry.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } });
};

const getStats = async (schoolId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalToday, byCategory, currentlyInside] = await Promise.all([
    prisma.gateEntry.count({
      where: { schoolId, deletedAt: null, inTime: { gte: today, lt: tomorrow } },
    }),
    prisma.gateEntry.groupBy({
      by: ["category"],
      where: { schoolId, deletedAt: null, inTime: { gte: today, lt: tomorrow } },
      _count: true,
    }),
    prisma.gateEntry.count({
      where: { schoolId, deletedAt: null, outTime: null, inTime: { gte: today } },
    }),
  ]);

  return { totalToday, byCategory, currentlyInside };
};

const gateEntryService = { create, getById, list, update, remove, getStats };
export default gateEntryService;
