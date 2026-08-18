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

const isSuperAdmin = (req) => req.context.user?.role?.name === RoleName.SUPER_ADMIN;

// School users are always scoped to their own school.
// Super Admin: list/stats across all schools (optionally filtered by ?schoolId); create/sync require an explicit schoolId.
const resolveListSchoolId = (req) => (isSuperAdmin(req) ? req.query.schoolId || undefined : req.context.user.schoolId);

router.post(
  "/",
  withPermission(Permission.CREATE_GATE_ENTRY),
  validateRequest(createGateEntrySchema),
  async (req, res) => {
    const currentUser = req.context.user;
    let schoolId = currentUser.schoolId;
    if (isSuperAdmin(req)) {
      schoolId = req.body.request.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "schoolId is required when creating a gate entry from Super Admin" });
      }
    }
    const entry = await gateEntryService.create(req.body.request, schoolId, currentUser.id);
    res.status(201).json({ message: "Gate entry recorded successfully", data: entry });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_GATE_ENTRIES),
  validateRequest(listGateEntriesSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { entries, pagination } = await gateEntryService.list(resolveListSchoolId(req), req.query, req.query);
    res.json({ message: "Gate entries retrieved", data: entries, ...pagination });
  },
);

router.get(
  "/stats",
  withPermission(Permission.GET_GATE_ENTRIES),
  async (req, res) => {
    const currentUser = req.context.user;
    const stats = await gateEntryService.getStats(resolveListSchoolId(req));
    res.json({ message: "Gate entry stats retrieved", data: stats });
  },
);

router.post(
  "/sync-crm",
  withPermission(Permission.GET_GATE_ENTRIES),
  async (req, res) => {
    const currentUser = req.context.user;
    let schoolId = currentUser.schoolId;
    if (isSuperAdmin(req)) {
      schoolId = req.query.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "schoolId is required when syncing CRM leads from Super Admin" });
      }
    }
    const result = await gateEntryService.syncMissingLeads(schoolId);
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
    // Super Admin sees any school's entry; school users are scoped to their own school.
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    const entry = await gateEntryService.getById(req.params.id, schoolId);
    res.json({ message: "Gate entry retrieved", data: entry });
  },
);

router.patch(
  "/:id",
  withPermission(Permission.UPDATE_GATE_ENTRY),
  validateRequest(updateGateEntrySchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    const entry = await gateEntryService.update(req.params.id, req.body.request, schoolId);
    res.json({ message: "Gate entry updated", data: entry });
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_GATE_ENTRY),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    await gateEntryService.remove(req.params.id, schoolId, currentUser.id);
    res.json({ message: "Gate entry deleted" });
  },
);

export default router;
