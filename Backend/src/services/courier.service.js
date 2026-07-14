import prisma from "../prisma/client.js";
import { CourierDispatchStatus } from "../prisma/generated/index.js";

function buildSearchWhere(search) {
  if (!search || !String(search).trim()) return {};
  const q = String(search).trim();
  return {
    OR: [
      { trackingNumber: { contains: q, mode: "insensitive" } },
      { recipient: { contains: q, mode: "insensitive" } },
      { destination: { contains: q, mode: "insensitive" } },
    ],
  };
}

export async function listSchoolCouriers({
  schoolId,
  status,
  search,
  page = 1,
  limit = 50,
}) {
  const where = {
    schoolId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...buildSearchWhere(search),
  };

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [items, total, statusGroups] = await Promise.all([
    prisma.schoolCourier.findMany({
      where,
      orderBy: [{ dispatchDate: "desc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.schoolCourier.count({ where }),
    prisma.schoolCourier.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
  ]);

  const byStatus = Object.values(CourierDispatchStatus).reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {});
  for (const row of statusGroups) {
    byStatus[row.status] = row._count._all;
  }

  return {
    data: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: take,
      totalPages: Math.ceil(total / take) || 0,
    },
    aggregates: { byStatus, total },
  };
}

export async function createSchoolCourier({
  schoolId,
  userId,
  trackingNumber,
  provider,
  recipient,
  destination,
  contents,
  status,
  dispatchDate,
}) {
  const dup = await prisma.schoolCourier.findFirst({
    where: {
      schoolId,
      trackingNumber: trackingNumber.trim(),
      deletedAt: null,
    },
  });
  if (dup) {
    const err = new Error(
      `A courier entry with tracking number '${trackingNumber.trim()}' already exists for this school.`,
    );
    err.statusCode = 400;
    throw err;
  }

  const st = status || CourierDispatchStatus.DISPATCHED;
  const dispatch = dispatchDate ? new Date(dispatchDate) : new Date();
  const deliveryDate =
    st === CourierDispatchStatus.DELIVERED ? new Date() : null;

  return prisma.schoolCourier.create({
    data: {
      schoolId,
      trackingNumber: trackingNumber.trim(),
      provider: provider.trim(),
      recipient: recipient.trim(),
      destination: destination.trim(),
      contents: (contents ?? "").trim(),
      status: st,
      dispatchDate: dispatch,
      deliveryDate,
      createdBy: userId,
    },
  });
}

export async function updateSchoolCourier({
  id,
  schoolId,
  userId,
  patch: body,
}) {
  const row = await prisma.schoolCourier.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!row) {
    const err = new Error("Courier entry not found!");
    err.statusCode = 404;
    throw err;
  }

  if (
    body.trackingNumber !== undefined &&
    body.trackingNumber.trim() !== row.trackingNumber
  ) {
    const dup = await prisma.schoolCourier.findFirst({
      where: {
        schoolId,
        trackingNumber: body.trackingNumber.trim(),
        deletedAt: null,
        NOT: { id },
      },
    });
    if (dup) {
      const err = new Error(
        `A courier entry with tracking number '${body.trackingNumber.trim()}' already exists for this school.`,
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const data = { updatedBy: userId };
  if (body.trackingNumber !== undefined)
    data.trackingNumber = body.trackingNumber.trim();
  if (body.provider !== undefined) data.provider = body.provider.trim();
  if (body.recipient !== undefined) data.recipient = body.recipient.trim();
  if (body.destination !== undefined)
    data.destination = body.destination.trim();
  if (body.contents !== undefined) data.contents = (body.contents ?? "").trim();
  if (body.status !== undefined) data.status = body.status;
  if (body.dispatchDate !== undefined)
    data.dispatchDate = new Date(body.dispatchDate);

  const nextStatus = data.status ?? row.status;
  if (nextStatus === CourierDispatchStatus.DELIVERED) {
    data.deliveryDate = row.deliveryDate ?? new Date();
  } else {
    data.deliveryDate = null;
  }

  return prisma.schoolCourier.update({
    where: { id },
    data,
  });
}

export async function softDeleteSchoolCourier({ id, schoolId, userId }) {
  const row = await prisma.schoolCourier.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!row) {
    const err = new Error("Courier entry not found!");
    err.statusCode = 404;
    throw err;
  }

  await prisma.schoolCourier.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });
}
