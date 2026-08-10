import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const CRM_SYNC_CATEGORIES = ["ADMISSION_ENQUIRY", "VISITOR"];

const categoryToLeadCategory = (category) => {
  if (category === "ADMISSION_ENQUIRY") return "Admission Enquiry";
  if (category === "VISITOR") return "Visitor";
  return category;
};

const buildLeadRemark = (entry) => {
  const parts = [];
  if (entry.reason) parts.push(`Purpose of visit: ${entry.reason}`);
  if (entry.classInterestedIn) parts.push(`Class interested in: ${entry.classInterestedIn}`);
  if (entry.personToMeet) parts.push(`Person to meet: ${entry.personToMeet}`);
  parts.push(`Walk-in date & time: ${new Date(entry.inTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
  parts.push(`Source: Gate Walk-in (entry #${entry.serialNo})`);
  return parts.join(" | ");
};

const create = async (data, schoolId, userId) => {
  try {
    const lastEntry = await prisma.gateEntry.findFirst({
      where: { schoolId },
      orderBy: { serialNo: "desc" },
      select: { serialNo: true },
    });
    const serialNo = (lastEntry?.serialNo || 0) + 1;

    const shouldSyncCrm = CRM_SYNC_CATEGORIES.includes(data.category);

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.gateEntry.create({
        data: {
          serialNo,
          category: data.category,
          name: data.name,
          phone: data.phone,
          reason: data.reason || null,
          classInterestedIn: data.classInterestedIn || null,
          personToMeet: data.personToMeet || null,
          photoFileId: data.photoFileId || null,
          schoolId,
          createdBy: userId,
        },
      });

      let linkedLead = null;
      if (shouldSyncCrm) {
        linkedLead = await tx.crmLead.create({
          data: {
            name: data.name,
            phone: data.phone,
            source: "GATE_WALK_IN",
            stage: "NEW",
            category: categoryToLeadCategory(data.category),
            classInterestedIn: data.classInterestedIn || null,
            purposeOfVisit: data.reason || null,
            schoolId,
            createdBy: userId,
          },
        });

        await tx.leadRemark.create({
          data: {
            leadId: linkedLead.id,
            content: buildLeadRemark({ ...entry, inTime: entry.inTime }),
            authorId: userId,
          },
        });

        await tx.gateEntry.update({
          where: { id: entry.id },
          data: { linkedLeadId: linkedLead.id },
        });
      }

      return { entry, linkedLead };
    });

    return { ...result.entry, linkedLead: result.linkedLead };
  } catch (error) {
    logger.error({ error: error.message }, "Failed to create gate entry");
    throw error;
  }
};

const getById = async (id, schoolId) => {
  const entry = await prisma.gateEntry.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: {
      linkedLead: {
        select: { id: true, name: true, stage: true, followUpStatus: true, source: true },
      },
      creator: { select: { id: true, firstName: true, lastName: true } },
    },
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
  if (filters.crmSynced !== undefined && filters.crmSynced !== null) {
    where.linkedLeadId = filters.crmSynced === "true" ? { not: null } : null;
  }
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
      include: {
        linkedLead: {
          select: { id: true, name: true, stage: true, followUpStatus: true, source: true },
        },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
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
  if (data.classInterestedIn !== undefined) updateData.classInterestedIn = data.classInterestedIn;
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

  const [totalToday, byCategory, currentlyInside, crmLeadsToday] = await Promise.all([
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
    prisma.gateEntry.count({
      where: { schoolId, deletedAt: null, linkedLeadId: { not: null }, inTime: { gte: today, lt: tomorrow } },
    }),
  ]);

  return { totalToday, byCategory, currentlyInside, crmLeadsToday };
};

const syncMissingLeads = async (schoolId) => {
  const missing = await prisma.gateEntry.findMany({
    where: {
      schoolId,
      deletedAt: null,
      linkedLeadId: null,
      category: { in: CRM_SYNC_CATEGORIES },
    },
    orderBy: { inTime: "asc" },
  });

  let synced = 0;
  for (const entry of missing) {
    await prisma.$transaction(async (tx) => {
      const lead = await tx.crmLead.create({
        data: {
          name: entry.name,
          phone: entry.phone,
          source: "GATE_WALK_IN",
          stage: "NEW",
          category: categoryToLeadCategory(entry.category),
          classInterestedIn: entry.classInterestedIn || null,
          purposeOfVisit: entry.reason || null,
          schoolId: entry.schoolId,
          createdBy: entry.createdBy,
        },
      });
      await tx.leadRemark.create({
        data: { leadId: lead.id, content: buildLeadRemark(entry), authorId: entry.createdBy },
      });
      await tx.gateEntry.update({ where: { id: entry.id }, data: { linkedLeadId: lead.id } });
    });
    synced += 1;
  }

  return { synced, processed: missing.length };
};

const getConversionReport = async ({ schoolId, startDate, endDate } = {}) => {
  const where = { deletedAt: null };
  if (schoolId) where.schoolId = schoolId;
  if (startDate || endDate) {
    where.inTime = {};
    if (startDate) where.inTime.gte = new Date(startDate);
    if (endDate) where.inTime.lte = new Date(endDate);
  }

  const [gateEntries, schoolMap] = await Promise.all([
    prisma.gateEntry.findMany({
      where,
      include: { linkedLead: { select: { followUpStatus: true, stage: true } } },
    }),
    prisma.school.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true },
    }),
  ]);
  const schoolById = new Map(schoolMap.map((s) => [s.id, s]));

  const perSchool = new Map();
  let totalEntries = 0;
  let totalLeads = 0;
  const statusTotals = { PENDING: 0, INTERESTED: 0, NOT_INTERESTED: 0, CONVERTED: 0, LOST: 0 };

  const dailyMap = new Map();

  for (const entry of gateEntries) {
    const sid = entry.schoolId;
    if (!perSchool.has(sid)) {
      perSchool.set(sid, {
        schoolId: sid,
        schoolName: schoolById.get(sid)?.name || "Unknown",
        schoolCode: schoolById.get(sid)?.code || null,
        entries: 0,
        leads: 0,
        conversionRate: 0,
        status: { PENDING: 0, INTERESTED: 0, NOT_INTERESTED: 0, CONVERTED: 0, LOST: 0 },
      });
    }
    const row = perSchool.get(sid);
    row.entries += 1;
    totalEntries += 1;

    if (entry.linkedLead) {
      row.leads += 1;
      totalLeads += 1;
      const st = entry.linkedLead.followUpStatus || "PENDING";
      row.status[st] = (row.status[st] || 0) + 1;
      statusTotals[st] = (statusTotals[st] || 0) + 1;
    }

    const dayKey = new Date(entry.inTime).toISOString().slice(0, 10);
    if (!dailyMap.has(dayKey)) dailyMap.set(dayKey, { date: dayKey, entries: 0, leads: 0 });
    const d = dailyMap.get(dayKey);
    d.entries += 1;
    if (entry.linkedLead) d.leads += 1;
  }

  const schools = Array.from(perSchool.values()).map((s) => ({
    ...s,
    conversionRate: s.entries > 0 ? Math.round((s.leads / s.entries) * 1000) / 10 : 0,
  }));

  const daily = Array.from(dailyMap.values()).sort((a, b) => (a.date < b.date ? -1 : 1));

  return {
    totalEntries,
    totalLeads,
    overallConversionRate: totalEntries > 0 ? Math.round((totalLeads / totalEntries) * 1000) / 10 : 0,
    status: statusTotals,
    schools,
    daily,
  };
};

const gateEntryService = { create, getById, list, update, remove, getStats, syncMissingLeads, getConversionReport };
export default gateEntryService;
