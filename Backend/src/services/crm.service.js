import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const createLead = async (data, schoolId, userId) => {
  try {
    const lead = await prisma.crmLead.create({
      data: {
        name: data.name,
        phone: data.phone,
        source: data.source,
        category: data.category || null,
        assignedToId: data.assignedToId || null,
        schoolId,
        createdBy: userId,
      },
    });

    if (data.remarks) {
      await prisma.leadRemark.create({
        data: { leadId: lead.id, content: data.remarks, authorId: userId },
      });
    }

    return lead;
  } catch (error) {
    logger.error({ error: error.message }, "Failed to create CRM lead");
    throw error;
  }
};

const getLeadById = async (id, schoolId) => {
  const lead = await prisma.crmLead.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: {
      remarks: { orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, firstName: true, lastName: true } } } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
      gateEntries: { select: { id: true, serialNo: true, inTime: true } },
    },
  });
  if (!lead) throw new Error("Lead not found");
  return lead;
};

const listLeads = async (schoolId, filters = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { schoolId, deletedAt: null };
  if (filters.stage) where.stage = filters.stage;
  if (filters.source) where.source = filters.source;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.crmLead.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { remarks: true } },
      },
    }),
    prisma.crmLead.count({ where }),
  ]);

  return { leads, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const updateLead = async (id, data, schoolId) => {
  const existing = await prisma.crmLead.findFirst({ where: { id, schoolId, deletedAt: null } });
  if (!existing) throw new Error("Lead not found");

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.stage !== undefined) updateData.stage = data.stage;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
  if (data.nextFollowUpAt !== undefined) updateData.nextFollowUpAt = data.nextFollowUpAt;

  return prisma.crmLead.update({ where: { id }, data: updateData });
};

const addRemark = async (leadId, content, userId, schoolId) => {
  const lead = await prisma.crmLead.findFirst({ where: { id: leadId, schoolId, deletedAt: null } });
  if (!lead) throw new Error("Lead not found");

  return prisma.leadRemark.create({
    data: { leadId, content, authorId: userId },
    include: { author: { select: { id: true, firstName: true, lastName: true } } },
  });
};

const removeLead = async (id, schoolId, userId) => {
  const existing = await prisma.crmLead.findFirst({ where: { id, schoolId, deletedAt: null } });
  if (!existing) throw new Error("Lead not found");
  return prisma.crmLead.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: userId } });
};

const getFunnelStats = async (schoolId) => {
  const where = { schoolId, deletedAt: null };
  const [total, byStage] = await Promise.all([
    prisma.crmLead.count({ where }),
    prisma.crmLead.groupBy({
      by: ["stage"],
      where,
      _count: true,
    }),
  ]);

  const stageMap = {};
  byStage.forEach((s) => { stageMap[s.stage] = s._count; });

  return {
    total,
    stages: {
      NEW: stageMap.NEW || 0,
      CONTACTABLE: stageMap.CONTACTABLE || 0,
      CONTACTED: stageMap.CONTACTED || 0,
      CONNECTED: stageMap.CONNECTED || 0,
      FOLLOW_UP_SCHEDULED: stageMap.FOLLOW_UP_SCHEDULED || 0,
      ADMISSION_DONE: stageMap.ADMISSION_DONE || 0,
      LOST: stageMap.LOST || 0,
    },
  };
};

const crmService = { createLead, getLeadById, listLeads, updateLead, addRemark, removeLead, getFunnelStats };
export default crmService;
