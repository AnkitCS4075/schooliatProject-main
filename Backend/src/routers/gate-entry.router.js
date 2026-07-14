import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import gateEntryService from "../services/gate-entry.service.js";
import createGateEntrySchema from "../schemas/gate-entry/create-gate-entry.schema.js";
import updateGateEntrySchema from "../schemas/gate-entry/update-gate-entry.schema.js";
import listGateEntriesSchema from "../schemas/gate-entry/list-gate-entries.schema.js";

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_GATE_ENTRY),
  validateRequest(createGateEntrySchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const entry = await gateEntryService.create(req.body.request, currentUser.schoolId, currentUser.id);
    res.status(201).json({ message: "Gate entry recorded successfully", data: entry });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_GATE_ENTRIES),
  validateRequest(listGateEntriesSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { entries, pagination } = await gateEntryService.list(currentUser.schoolId, req.query, req.query);
    res.json({ message: "Gate entries retrieved", data: entries, ...pagination });
  },
);

router.get(
  "/stats",
  withPermission(Permission.GET_GATE_ENTRIES),
  async (req, res) => {
    const currentUser = req.context.user;
    const stats = await gateEntryService.getStats(currentUser.schoolId);
    res.json({ message: "Gate entry stats retrieved", data: stats });
  },
);

router.get(
  "/:id",
  withPermission(Permission.GET_GATE_ENTRIES),
  async (req, res) => {
    const currentUser = req.context.user;
    const entry = await gateEntryService.getById(req.params.id, currentUser.schoolId);
    res.json({ message: "Gate entry retrieved", data: entry });
  },
);

router.patch(
  "/:id",
  withPermission(Permission.UPDATE_GATE_ENTRY),
  validateRequest(updateGateEntrySchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const entry = await gateEntryService.update(req.params.id, req.body.request, currentUser.schoolId);
    res.json({ message: "Gate entry updated", data: entry });
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_GATE_ENTRY),
  async (req, res) => {
    const currentUser = req.context.user;
    await gateEntryService.remove(req.params.id, currentUser.schoolId, currentUser.id);
    res.json({ message: "Gate entry deleted" });
  },
);

export default router;
