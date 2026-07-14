import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import listCouriersSchema from "../schemas/courier/list-couriers.schema.js";
import createCourierSchema from "../schemas/courier/create-courier.schema.js";
import updateCourierSchema from "../schemas/courier/update-courier.schema.js";
import deleteCourierSchema from "../schemas/courier/delete-courier.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import {
  listSchoolCouriers,
  createSchoolCourier,
  updateSchoolCourier,
  softDeleteSchoolCourier,
} from "../services/courier.service.js";

const router = Router();

router.get(
  "/",
  withPermission(Permission.GET_COURIERS),
  validateRequest(listCouriersSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school!" });
    }

    const { status, search, page, limit } = req.query;

    const result = await listSchoolCouriers({
      schoolId,
      status,
      search,
      page,
      limit,
    });

    return res.json({
      message: "Couriers fetched successfully!",
      data: result.data,
      pagination: result.pagination,
      aggregates: result.aggregates,
    });
  },
);

router.post(
  "/",
  withPermission(Permission.CREATE_COURIER_ENTRY),
  validateRequest(createCourierSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;

    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school!" });
    }

    const body = req.body.request;

    try {
      const created = await createSchoolCourier({
        schoolId,
        userId: currentUser.id,
        trackingNumber: body.trackingNumber,
        provider: body.provider,
        recipient: body.recipient,
        destination: body.destination,
        contents: body.contents,
        status: body.status,
        dispatchDate: body.dispatchDate,
      });

      return res.status(201).json({
        message: "Courier entry created successfully!",
        data: created,
      });
    } catch (e) {
      if (e.statusCode === 400) {
        return res.status(400).json({ message: e.message });
      }
      throw e;
    }
  },
);

router.patch(
  "/:id",
  withPermission(Permission.UPDATE_COURIER_ENTRY),
  validateRequest(updateCourierSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;
    const { id } = req.params;

    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school!" });
    }

    try {
      const updated = await updateSchoolCourier({
        id,
        schoolId,
        userId: currentUser.id,
        patch: req.body.request,
      });

      return res.json({
        message: "Courier entry updated successfully!",
        data: updated,
      });
    } catch (e) {
      if (e.statusCode === 400) {
        return res.status(400).json({ message: e.message });
      }
      if (e.statusCode === 404) {
        return res.status(404).json({ message: e.message });
      }
      throw e;
    }
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_COURIER_ENTRY),
  validateRequest(deleteCourierSchema),
  requireDeletionOTP({ entityType: "Courier" }),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = currentUser.schoolId;
    const { id } = req.params;

    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "User is not associated with a school!" });
    }

    try {
      await softDeleteSchoolCourier({
        id,
        schoolId,
        userId: currentUser.id,
      });

      return res.json({ message: "Courier entry deleted successfully!" });
    } catch (e) {
      if (e.statusCode === 404) {
        return res.status(404).json({ message: e.message });
      }
      throw e;
    }
  },
);

export default router;
