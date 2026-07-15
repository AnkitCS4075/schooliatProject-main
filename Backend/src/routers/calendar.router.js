import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import paginateUtil from "../utils/paginate.util.js";
import dateUtil from "../utils/date.util.js";
import calendarService from "../services/calendar.service.js";
import getCalendarSchema from "../schemas/calendar/get-calendar.schema.js";
import getEventsSchema from "../schemas/calendar/get-events.schema.js";
import updateEventSchema from "../schemas/calendar/update-event.schema.js";
import deleteEventSchema from "../schemas/calendar/delete-event.schema.js";
import getHolidaysSchema from "../schemas/calendar/get-holidays.schema.js";
import updateHolidaySchema from "../schemas/calendar/update-holiday.schema.js";
import deleteHolidaySchema from "../schemas/calendar/delete-holiday.schema.js";
import getExamCalendarsSchema from "../schemas/calendar/get-exam-calendars.schema.js";
import createExamCalendarSchema from "../schemas/calendar/create-exam-calendar.schema.js";
import updateExamCalendarSchema from "../schemas/calendar/update-exam-calendar.schema.js";
import deleteExamCalendarSchema from "../schemas/calendar/delete-exam-calendar.schema.js";
import getNoticesSchema from "../schemas/calendar/get-notices.schema.js";
import createEventSchema from "../schemas/calendar/create-event.schema.js";
import createHolidaySchema from "../schemas/calendar/create-holiday.schema.js";
import updateNoticeSchema from "../schemas/calendar/update-notice.schema.js";
import deleteNoticeSchema from "../schemas/calendar/delete-notice.schema.js";
import { bulkDeleteNoticesSchema } from "../schemas/calendar/bulk-delete-notices.schema.js";
import createNoticeSchema from "../schemas/calendar/create-notice.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import otpDeletionService from "../services/otp-deletion.service.js";
import { resolveDeletionOtpRecipientEmail } from "../services/deletion-otp-recipient.service.js";

const router = Router();

// Mobile API: GET /calendar (same as GET /calendar/events – calendar view)
router.get(
  "/",
  withPermission(Permission.GET_EVENTS),
  validateRequest(getEventsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;
    const { month, date } = req.query;
    const where = {
      schoolId: schoolId || null,
      deletedAt: null,
      deletedBy: null,
    };
    if (month) {
      const { year, month: monthNum } = dateUtil.parseMonthFormat(month);
      const firstDayOfMonth = dateUtil.getFirstDayOfMonth(monthNum, year);
      const lastDayOfMonth = dateUtil.getLastDayOfMonth(monthNum, year);
      where.from = { lte: lastDayOfMonth };
      where.till = { gte: firstDayOfMonth };
    }
    if (date) {
      const inputDate = new Date(date);
      const startOfDay = dateUtil.getStartOfDay(inputDate);
      const endOfDay = dateUtil.getEndOfDay(inputDate);
      where.from = { lte: endOfDay };
      where.till = { gte: startOfDay };
    }
    const events = await prisma.event.findMany({
      where,
      ...paginateUtil.getPaginationParams(req),
    });
    return res.json({ message: "Events fetched!", data: events });
  },
);

// Event endpoints
router.post(
  "/events",
  withPermission(Permission.CREATE_EVENT),
  validateRequest(createEventSchema),
  async (req, res) => {
    const createData = req.body.request || {};
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    const dateType = dateUtil.determineDateType(
      createData.from,
      createData.till,
    );

    const newEvent = await prisma.event.create({
      data: {
        title: createData.title,
        description: createData.description,
        dateType,
        from: new Date(createData.from),
        till: new Date(createData.till),
        visibleFrom: new Date(createData.visibleFrom),
        visibleTill: new Date(createData.visibleTill),
        schoolId: schoolId || null,
        createdBy: currentUser.id,
        approvalStatus: "PENDING",
      },
    });

    return res.json({ message: "Event created!", data: newEvent });
  },
);

router.get(
  "/events",
  withPermission(Permission.GET_EVENTS),
  validateRequest(getEventsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;
    const { month, date } = req.query;

    const where = {
      schoolId: schoolId || null,
      deletedAt: null,
      deletedBy: null,
      approvalStatus: req.query.approvalStatus || (currentUser.role?.name === "SCHOOL_ADMIN" ? undefined : "APPROVED"),
    };

    // Filter by month (YYYY-MM format): from >= 1st of month AND till <= last of month
    if (month) {
      const { year, month: monthNum } = dateUtil.parseMonthFormat(month);
      const firstDayOfMonth = dateUtil.getFirstDayOfMonth(monthNum, year);
      const lastDayOfMonth = dateUtil.getLastDayOfMonth(monthNum, year);

      where.from = { lte: lastDayOfMonth };
      where.till = { gte: firstDayOfMonth };
    }

    // Filter by date: from <= date AND till >= date
    if (date) {
      const inputDate = new Date(date);
      const startOfDay = dateUtil.getStartOfDay(inputDate);
      const endOfDay = dateUtil.getEndOfDay(inputDate);

      where.from = { lte: endOfDay };
      where.till = { gte: startOfDay };
    }

    const events = await prisma.event.findMany({
      where,
      ...paginateUtil.getPaginationParams(req),
    });

    return res.json({ message: "Events fetched!", data: events });
  },
);

// Get pending event approvals
router.get(
  "/events/pending-approvals",
  withPermission(Permission.GET_EVENTS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const events = await prisma.event.findMany({
        where: {
          schoolId: currentUser.schoolId,
          approvalStatus: "PENDING",
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        message: "Pending event approvals fetched",
        data: events,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch pending event approvals",
      });
    }
  },
);

router.patch(
  "/events/:id",
  withPermission(Permission.EDIT_EVENT),
  validateRequest(updateEventSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    const existingEvent = await prisma.event.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found!" });
    }

    const eventUpdateData = {};

    if (updateData.title !== undefined)
      eventUpdateData.title = updateData.title;
    if (updateData.description !== undefined)
      eventUpdateData.description = updateData.description;
    if (updateData.from !== undefined)
      eventUpdateData.from = new Date(updateData.from);
    if (updateData.till !== undefined)
      eventUpdateData.till = new Date(updateData.till);
    if (updateData.visibleFrom !== undefined)
      eventUpdateData.visibleFrom = new Date(updateData.visibleFrom);
    if (updateData.visibleTill !== undefined)
      eventUpdateData.visibleTill = new Date(updateData.visibleTill);

    // Auto-determine dateType if from or till dates are updated
    if (updateData.from !== undefined || updateData.till !== undefined) {
      const fromDate =
        updateData.from !== undefined ? updateData.from : existingEvent.from;
      const tillDate =
        updateData.till !== undefined ? updateData.till : existingEvent.till;
      eventUpdateData.dateType = dateUtil.determineDateType(fromDate, tillDate);
    }

    eventUpdateData.updatedBy = currentUser.id;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: eventUpdateData,
    });

    return res.json({ message: "Event updated!", data: updatedEvent });
  },
);

router.delete(
  "/events/:id",
  withPermission(Permission.DELETE_EVENT),
  validateRequest(deleteEventSchema),
  requireDeletionOTP({ entityType: "CalendarEvent" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingEvent = await prisma.event.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found!" });
    }

    await prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Event deleted!" });
  },
);

// Holiday endpoints
router.post(
  "/holidays",
  withPermission(Permission.CREATE_HOLIDAY),
  validateRequest(createHolidaySchema),
  async (req, res) => {
    const createData = req.body.request || {};
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    const dateType = dateUtil.determineDateType(
      createData.from,
      createData.till,
    );

    const newHoliday = await prisma.holiday.create({
      data: {
        title: createData.title,
        dateType,
        from: new Date(createData.from),
        till: new Date(createData.till),
        visibleFrom: new Date(createData.visibleFrom),
        visibleTill: new Date(createData.visibleTill),
        schoolId: schoolId || null,
        createdBy: currentUser.id,
      },
    });

    return res.json({ message: "Holiday created!", data: newHoliday });
  },
);

router.get(
  "/holidays",
  withPermission(Permission.GET_HOLIDAYS),
  validateRequest(getHolidaysSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;
    const { month, date } = req.query;

    const where = {
      schoolId: schoolId || null,
      deletedAt: null,
      deletedBy: null,
    };

    // Filter by month (YYYY-MM format): from >= 1st of month AND till <= last of month
    if (month) {
      const { year, month: monthNum } = dateUtil.parseMonthFormat(month);
      const firstDayOfMonth = dateUtil.getFirstDayOfMonth(monthNum, year);
      const lastDayOfMonth = dateUtil.getLastDayOfMonth(monthNum, year);

      where.from = { lte: lastDayOfMonth };
      where.till = { gte: firstDayOfMonth };
    }

    // Filter by date: from <= date AND till >= date
    if (date) {
      const inputDate = new Date(date);
      const startOfDay = dateUtil.getStartOfDay(inputDate);
      const endOfDay = dateUtil.getEndOfDay(inputDate);

      where.from = { lte: endOfDay };
      where.till = { gte: startOfDay };
    }

    const holidays = await prisma.holiday.findMany({
      where,
      ...paginateUtil.getPaginationParams(req),
    });

    return res.json({ message: "Holidays fetched!", data: holidays });
  },
);

router.patch(
  "/holidays/:id",
  withPermission(Permission.EDIT_HOLIDAY),
  validateRequest(updateHolidaySchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    const existingHoliday = await prisma.holiday.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingHoliday) {
      return res.status(404).json({ message: "Holiday not found!" });
    }

    const holidayUpdateData = {};

    if (updateData.title !== undefined)
      holidayUpdateData.title = updateData.title;
    if (updateData.from !== undefined)
      holidayUpdateData.from = new Date(updateData.from);
    if (updateData.till !== undefined)
      holidayUpdateData.till = new Date(updateData.till);
    if (updateData.visibleFrom !== undefined)
      holidayUpdateData.visibleFrom = new Date(updateData.visibleFrom);
    if (updateData.visibleTill !== undefined)
      holidayUpdateData.visibleTill = new Date(updateData.visibleTill);

    // Auto-determine dateType if from or till dates are updated
    if (updateData.from !== undefined || updateData.till !== undefined) {
      const fromDate =
        updateData.from !== undefined ? updateData.from : existingHoliday.from;
      const tillDate =
        updateData.till !== undefined ? updateData.till : existingHoliday.till;
      holidayUpdateData.dateType = dateUtil.determineDateType(
        fromDate,
        tillDate,
      );
    }

    holidayUpdateData.updatedBy = currentUser.id;

    const updatedHoliday = await prisma.holiday.update({
      where: { id },
      data: holidayUpdateData,
    });

    return res.json({ message: "Holiday updated!", data: updatedHoliday });
  },
);

router.delete(
  "/holidays/:id",
  withPermission(Permission.DELETE_HOLIDAY),
  validateRequest(deleteHolidaySchema),
  requireDeletionOTP({ entityType: "Holiday" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingHoliday = await prisma.holiday.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingHoliday) {
      return res.status(404).json({ message: "Holiday not found!" });
    }

    await prisma.holiday.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Holiday deleted!" });
  },
);

// ExamCalendar endpoints
router.post(
  "/exam-calendars",
  withPermission(Permission.CREATE_EXAM_CALENDAR),
  validateRequest(createExamCalendarSchema),
  async (req, res) => {
    const createData = req.body.request || {};
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    // Validate classId
    const classEntity = await prisma.class.findFirst({
      where: {
        id: createData.classId,
        deletedAt: null,
        deletedBy: null,
      },
    });
    if (!classEntity) {
      return res.status(404).json({ message: "Class not found or deleted!" });
    }

    // Validate examId
    const examEntity = await prisma.exam.findUnique({
      where: { id: createData.examId },
    });
    if (!examEntity) {
      return res.status(404).json({ message: "Exam not found!" });
    }

    // Create exam calendar with items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newExamCalendar = await tx.examCalendar.create({
        data: {
          classId: createData.classId,
          examId: createData.examId,
          title: createData.title,
          visibleFrom: new Date(createData.visibleFrom),
          visibleTill: new Date(createData.visibleTill),
          schoolId: schoolId || null,
          createdBy: currentUser.id,
        },
      });

      // Create exam calendar items if provided
      let items = [];
      if (createData.items && createData.items.length > 0) {
        const itemsData = createData.items.map((item) => ({
          examCalendarId: newExamCalendar.id,
          subject: item.subject,
          date: new Date(item.date),
          createdBy: currentUser.id,
        }));

        await tx.examCalendarItem.createMany({
          data: itemsData,
        });

        items = await tx.examCalendarItem.findMany({
          where: {
            examCalendarId: newExamCalendar.id,
            deletedAt: null,
            deletedBy: null,
          },
        });
      }

      return { ...newExamCalendar, items };
    });

    return res.json({
      message: "Exam calendar created!",
      data: result,
    });
  },
);

router.get(
  "/exam-calendars",
  withPermission(Permission.GET_EXAM_CALENDARS),
  validateRequest(getExamCalendarsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    const examCalendars = await prisma.examCalendar.findMany({
      where: {
        schoolId: schoolId || null,
        deletedAt: null,
        deletedBy: null,
      },
      ...paginateUtil.getPaginationParams(req),
    });

    return res.json({
      message: "Exam calendars fetched!",
      data: examCalendars,
    });
  },
);

router.patch(
  "/exam-calendars/:id",
  withPermission(Permission.EDIT_EXAM_CALENDAR),
  validateRequest(updateExamCalendarSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    const existingExamCalendar = await prisma.examCalendar.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingExamCalendar) {
      return res.status(404).json({ message: "Exam calendar not found!" });
    }

    // Validate classId if provided
    if (updateData.classId != null) {
      const classEntity = await prisma.class.findFirst({
        where: {
          id: updateData.classId,
          deletedAt: null,
          deletedBy: null,
        },
      });
      if (!classEntity) {
        return res.status(404).json({ message: "Class not found or deleted!" });
      }
    }

    // Validate examId if provided
    if (updateData.examId != null) {
      const examEntity = await prisma.exam.findUnique({
        where: { id: updateData.examId },
      });
      if (!examEntity) {
        return res.status(404).json({ message: "Exam not found!" });
      }
    }

    const examCalendarUpdateData = {};

    if (updateData.classId !== undefined)
      examCalendarUpdateData.classId = updateData.classId;
    if (updateData.examId !== undefined)
      examCalendarUpdateData.examId = updateData.examId;
    if (updateData.title !== undefined)
      examCalendarUpdateData.title = updateData.title;
    if (updateData.visibleFrom !== undefined)
      examCalendarUpdateData.visibleFrom = new Date(updateData.visibleFrom);
    if (updateData.visibleTill !== undefined)
      examCalendarUpdateData.visibleTill = new Date(updateData.visibleTill);

    examCalendarUpdateData.updatedBy = currentUser.id;

    // Update exam calendar and manage items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedExamCalendar = await tx.examCalendar.update({
        where: { id },
        data: examCalendarUpdateData,
      });

      let items = [];

      // Handle items if provided in the request
      if (updateData.items !== undefined) {
        // Fetch existing items
        const existingItems = await tx.examCalendarItem.findMany({
          where: {
            examCalendarId: id,
            deletedAt: null,
            deletedBy: null,
          },
        });

        const incomingItems = updateData.items || [];
        const existingItemsMap = new Map(
          existingItems.map((item) => [item.id, item]),
        );
        const existingSubjectsMap = new Map(
          existingItems.map((item) => [item.subject, item]),
        );
        const incomingItemIds = new Set();
        const incomingSubjects = new Set();

        // Process incoming items
        for (const item of incomingItems) {
          if (item.id) {
            incomingItemIds.add(item.id);
          }
          incomingSubjects.add(item.subject);
        }

        // Items to update, create, or delete
        const itemsToUpdate = [];
        const itemsToCreate = [];

        for (const item of incomingItems) {
          if (item.id && existingItemsMap.has(item.id)) {
            // Update existing item by ID
            itemsToUpdate.push({
              id: item.id,
              subject: item.subject,
              date: new Date(item.date),
              updatedBy: currentUser.id,
            });
          } else if (!item.id && existingSubjectsMap.has(item.subject)) {
            // Update existing item by subject match
            const existingItem = existingSubjectsMap.get(item.subject);
            itemsToUpdate.push({
              id: existingItem.id,
              subject: item.subject,
              date: new Date(item.date),
              updatedBy: currentUser.id,
            });
            incomingItemIds.add(existingItem.id);
          } else {
            // Create new item
            itemsToCreate.push({
              examCalendarId: id,
              subject: item.subject,
              date: new Date(item.date),
              createdBy: currentUser.id,
            });
          }
        }

        // Items to delete (soft delete) - existing items not in incoming items
        const itemsToDelete = existingItems.filter(
          (item) =>
            !incomingItemIds.has(item.id) &&
            !incomingSubjects.has(item.subject),
        );

        // Perform updates
        for (const item of itemsToUpdate) {
          await tx.examCalendarItem.update({
            where: { id: item.id },
            data: {
              subject: item.subject,
              date: item.date,
              updatedBy: item.updatedBy,
            },
          });
        }

        // Perform creates
        if (itemsToCreate.length > 0) {
          await tx.examCalendarItem.createMany({
            data: itemsToCreate,
          });
        }

        // Perform soft deletes
        for (const item of itemsToDelete) {
          await tx.examCalendarItem.update({
            where: { id: item.id },
            data: {
              deletedAt: new Date(),
              deletedBy: currentUser.id,
            },
          });
        }

        // Fetch updated items
        items = await tx.examCalendarItem.findMany({
          where: {
            examCalendarId: id,
            deletedAt: null,
            deletedBy: null,
          },
        });
      } else {
        // Fetch existing items if items not provided in request
        items = await tx.examCalendarItem.findMany({
          where: {
            examCalendarId: id,
            deletedAt: null,
            deletedBy: null,
          },
        });
      }

      return { ...updatedExamCalendar, items };
    });

    return res.json({
      message: "Exam calendar updated!",
      data: result,
    });
  },
);

router.delete(
  "/exam-calendars/:id",
  withPermission(Permission.DELETE_EXAM_CALENDAR),
  validateRequest(deleteExamCalendarSchema),
  requireDeletionOTP({ entityType: "ExamCalendar" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingExamCalendar = await prisma.examCalendar.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingExamCalendar) {
      return res.status(404).json({ message: "Exam calendar not found!" });
    }

    await prisma.examCalendar.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Exam calendar deleted!" });
  },
);

// Notice endpoints
router.post(
  "/notices",
  withPermission(Permission.CREATE_NOTICE),
  validateRequest(createNoticeSchema),
  async (req, res) => {
    const createData = req.body.request || {};
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    const newNotice = await prisma.notice.create({
      data: {
        title: createData.title,
        content: createData.content,
        visibleFrom: new Date(createData.visibleFrom),
        visibleTill: new Date(createData.visibleTill),
        schoolId: schoolId || null,
        createdBy: currentUser.id,
      },
    });

    return res.json({ message: "Notice created!", data: newNotice });
  },
);

router.get(
  "/notices",
  withPermission(Permission.GET_NOTICES),
  validateRequest(getNoticesSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    const notices = await prisma.notice.findMany({
      where: {
        schoolId: schoolId || null,
        deletedAt: null,
        deletedBy: null,
      },
      orderBy: { createdAt: "desc" },
      ...paginateUtil.getPaginationParams(req),
    });

    return res.json({ message: "Notices fetched!", data: notices });
  },
);

router.patch(
  "/notices/:id",
  withPermission(Permission.EDIT_NOTICE),
  validateRequest(updateNoticeSchema),
  async (req, res) => {
    const { id } = req.params;
    const updateData = req.body.request || {};
    const currentUser = req.context.user;

    const existingNotice = await prisma.notice.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingNotice) {
      return res.status(404).json({ message: "Notice not found!" });
    }

    const noticeUpdateData = {};

    if (updateData.title !== undefined)
      noticeUpdateData.title = updateData.title;
    if (updateData.content !== undefined)
      noticeUpdateData.content = updateData.content;
    if (updateData.visibleFrom !== undefined)
      noticeUpdateData.visibleFrom = new Date(updateData.visibleFrom);
    if (updateData.visibleTill !== undefined)
      noticeUpdateData.visibleTill = new Date(updateData.visibleTill);

    noticeUpdateData.updatedBy = currentUser.id;

    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: noticeUpdateData,
    });

    return res.json({ message: "Notice updated!", data: updatedNotice });
  },
);

router.post(
  "/notices/bulk-delete",
  withPermission(Permission.DELETE_NOTICE),
  validateRequest(bulkDeleteNoticesSchema),
  async (req, res) => {
    try {
      const { otp, noticeIds } = req.body.request;
      const currentUser = req.context.user;
      const recipient = await resolveDeletionOtpRecipientEmail(currentUser);
      if (!recipient) {
        return res.status(400).json({ message: "No email available for deletion verification" });
      }
      const ok = await otpDeletionService.verifyDeletionOTP({
        otpRecipientEmail: recipient,
        otpCode: String(otp).trim(),
        entityType: "Notice",
        entityId: `bulk:${noticeIds.length}`,
      });
      if (!ok) {
        return res.status(403).json({
          message:
            "Invalid or expired OTP. Request a new verification code and try again.",
          errorCode: "DELETION_OTP_INVALID",
        });
      }

      const result = await prisma.notice.updateMany({
        where: {
          id: { in: noticeIds },
          schoolId: currentUser.schoolId,
          deletedAt: null,
          deletedBy: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      return res.json({
        message: `${result.count} notice(s) deleted`,
        data: { count: result.count },
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to bulk delete notices",
      });
    }
  },
);

router.delete(
  "/notices/:id",
  withPermission(Permission.DELETE_NOTICE),
  validateRequest(deleteNoticeSchema),
  requireDeletionOTP({ entityType: "Notice" }),
  async (req, res) => {
    const { id } = req.params;
    const currentUser = req.context.user;

    const existingNotice = await prisma.notice.findUnique({
      where: { id, deletedAt: null, deletedBy: null },
    });

    if (!existingNotice) {
      return res.status(404).json({ message: "Notice not found!" });
    }

    await prisma.notice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return res.json({ message: "Notice deleted!" });
  },
);

// Get calendar by date endpoint (must be last to avoid matching specific routes)
router.get(
  "/:date",
  withPermission(Permission.GET_CALENDAR),
  validateRequest(getCalendarSchema),
  async (req, res) => {
    const { date } = req.params;
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    // Parse date string (YYYY-MM-DD) to Date object
    const dateObj = new Date(date);

    const calendarItems = await calendarService.getCalendar(
      dateObj,
      schoolId || null,
    );

    return res.json({
      message: "Calendar items fetched!",
      data: calendarItems,
    });
  },
);

// ─── Event Approval Endpoints ───────────────────────────────────────────

// Approve event
router.patch(
  "/events/:id/approve",
  withPermission(Permission.EDIT_EVENT),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const event = await prisma.event.findFirst({
        where: { id, schoolId: currentUser.schoolId, deletedAt: null },
      });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const updated = await prisma.event.update({
        where: { id },
        data: {
          approvalStatus: "APPROVED",
          approvedBy: currentUser.id,
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });

      return res.status(200).json({
        message: "Event approved successfully",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to approve event",
      });
    }
  },
);

// Reject event
router.patch(
  "/events/:id/reject",
  withPermission(Permission.EDIT_EVENT),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;
      const { reason } = req.body.request || {};

      const event = await prisma.event.findFirst({
        where: { id, schoolId: currentUser.schoolId, deletedAt: null },
      });
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const updated = await prisma.event.update({
        where: { id },
        data: {
          approvalStatus: "REJECTED",
          approvedBy: currentUser.id,
          approvedAt: new Date(),
          rejectionReason: reason || null,
        },
      });

      return res.status(200).json({
        message: "Event rejected",
        data: updated,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to reject event",
      });
    }
  },
);


export default router;
