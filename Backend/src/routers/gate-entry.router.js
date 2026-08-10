import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { Permission, RoleName } from "../prisma/generated/index.js";
import gateEntryService from "../services/gate-entry.service.js";
import createGateEntrySchema from "../schemas/gate-entry/create-gate-entry.schema.js";
import updateGateEntrySchema from "../schemas/gate-entry/update-gate-entry.schema.js";
import listGateEntriesSchema from "../schemas/gate-entry/list-gate-entries.schema.js";

const router = Router();

function requireSuperAdmin(req, res, next) {
  const roleName = req.context.user?.role?.name;
  if (roleName !== RoleName.SUPER_ADMIN) {
    return res.status(403).json({ message: "Only Super Admin can access this report" });
  }
  next();
}

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

router.post(
  "/sync-crm",
  withPermission(Permission.GET_GATE_ENTRIES),
  async (req, res) => {
    const currentUser = req.context.user;
    const result = await gateEntryService.syncMissingLeads(currentUser.schoolId);
    res.json({ message: "CRM sync completed", data: result });
  },
);

router.get(
  "/report/conversion",
  requireSuperAdmin,
  withPermission(Permission.GET_STATISTICS),
  async (req, res) => {
    const { schoolId, startDate, endDate } = req.query;
    const report = await gateEntryService.getConversionReport({ schoolId, startDate, endDate });
    res.json({ message: "Gate-to-CRM conversion report fetched", data: report });
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
