import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { Permission, RoleName } from "../prisma/generated/index.js";
import crmService from "../services/crm.service.js";
import createLeadSchema from "../schemas/crm/create-lead.schema.js";
import updateLeadSchema from "../schemas/crm/update-lead.schema.js";
import listLeadsSchema from "../schemas/crm/list-leads.schema.js";
import addRemarkSchema from "../schemas/crm/add-remark.schema.js";

const router = Router();

const isSuperAdmin = (req) => req.context.user?.role?.name === RoleName.SUPER_ADMIN;

// School users are always scoped to their own school.
// Super Admin: list/funnel across all schools (optionally filtered by ?schoolId); create requires an explicit schoolId.
const resolveListSchoolId = (req) => (isSuperAdmin(req) ? req.query.schoolId || undefined : req.context.user.schoolId);

router.post(
  "/",
  withPermission(Permission.CREATE_CRM_LEAD),
  validateRequest(createLeadSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    let schoolId = currentUser.schoolId;
    if (isSuperAdmin(req)) {
      schoolId = req.body.request.schoolId;
      if (!schoolId) {
        return res.status(400).json({ message: "schoolId is required when creating a lead from Super Admin" });
      }
    }
    const lead = await crmService.createLead(req.body.request, schoolId, currentUser.id);
    res.status(201).json({ message: "Lead created successfully", data: lead });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_CRM_LEADS),
  validateRequest(listLeadsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { leads, pagination } = await crmService.listLeads(resolveListSchoolId(req), req.query, req.query);
    res.json({ message: "Leads retrieved", data: leads, ...pagination });
  },
);

router.get(
  "/funnel",
  withPermission(Permission.GET_CRM_LEADS),
  async (req, res) => {
    const currentUser = req.context.user;
    const stats = await crmService.getFunnelStats(resolveListSchoolId(req));
    res.json({ message: "Funnel stats retrieved", data: stats });
  },
);

router.get(
  "/:id",
  withPermission(Permission.GET_CRM_LEADS),
  async (req, res) => {
    const currentUser = req.context.user;
    // Super Admin sees any school's lead; school users are scoped to their own school.
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    const lead = await crmService.getLeadById(req.params.id, schoolId);
    res.json({ message: "Lead retrieved", data: lead });
  },
);

router.patch(
  "/:id",
  withPermission(Permission.UPDATE_CRM_LEAD),
  validateRequest(updateLeadSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    const lead = await crmService.updateLead(req.params.id, req.body.request, schoolId);
    res.json({ message: "Lead updated", data: lead });
  },
);

router.post(
  "/:id/remarks",
  withPermission(Permission.UPDATE_CRM_LEAD),
  validateRequest(addRemarkSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    const remark = await crmService.addRemark(req.params.id, req.body.request.content, currentUser.id, schoolId);
    res.status(201).json({ message: "Remark added", data: remark });
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_CRM_LEAD),
  async (req, res) => {
    const currentUser = req.context.user;
    const schoolId = isSuperAdmin(req) ? undefined : currentUser.schoolId;
    await crmService.removeLead(req.params.id, schoolId, currentUser.id);
    res.json({ message: "Lead deleted" });
  },
);

export default router;
