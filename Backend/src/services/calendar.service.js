import prisma from "../prisma/client.js";

const getCalendar = async (date, schoolId = null) => {
  // Convert date to start and end of day for proper comparison
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const whereClause = {
    deletedAt: null,
    deletedBy: null,
    visibleFrom: {
      lte: endOfDay,
    },
    visibleTill: {
      gte: startOfDay,
    },
    ...(schoolId && { schoolId }),
  };

  const events = await prisma.event.findMany({
    where: {
      ...whereClause,
      from: {
        lte: endOfDay,
      },
      till: {
        gte: startOfDay,
      },
    },
    orderBy: {
      from: "asc",
    },
  });

  const holidays = await prisma.holiday.findMany({
    where: {
      ...whereClause,
      from: {
        lte: endOfDay,
      },
      till: {
        gte: startOfDay,
      },
    },
    orderBy: {
      from: "asc",
    },
  });

  const examCalendars = await prisma.examCalendar.findMany({
    where: whereClause,
    orderBy: {
      visibleFrom: "asc",
    },
  });

  const examCalendarIds = examCalendars.map((ec) => ec.id);

  const examCalendarItems =
    examCalendarIds.length > 0
      ? await prisma.examCalendarItem.findMany({
          where: {
            examCalendarId: {
              in: examCalendarIds,
            },
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            deletedAt: null,
            deletedBy: null,
          },
          orderBy: {
            date: "asc",
          },
        })
      : [];

  const itemsByCalendarId = examCalendarItems.reduce((acc, item) => {
    if (!acc[item.examCalendarId]) {
      acc[item.examCalendarId] = [];
    }
    acc[item.examCalendarId].push(item);
    return acc;
  }, {});

  const examCalendarsWithItems = examCalendars.map((calendar) => ({
    ...calendar,
    items: itemsByCalendarId[calendar.id] || [],
  }));

  return [
    ...events.map((e) => ({ ...e, type: "EVENT" })),
    ...holidays.map((h) => ({ ...h, type: "HOLIDAY" })),
    ...examCalendarsWithItems.map((ec) => ({ ...ec, type: "EXAM_CALENDAR" })),
  ];
};

const calendarService = {
  getCalendar,
};

export default calendarService;
