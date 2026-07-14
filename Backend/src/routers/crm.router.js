import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import crmService from "../services/crm.service.js";
import createLeadSchema from "../schemas/crm/create-lead.schema.js";
import updateLeadSchema from "../schemas/crm/update-lead.schema.js";
import listLeadsSchema from "../schemas/crm/list-leads.schema.js";
import addRemarkSchema from "../schemas/crm/add-remark.schema.js";

const router = Router();

router.post(
  "/",
  withPermission(Permission.CREATE_CRM_LEAD),
  validateRequest(createLeadSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const lead = await crmService.createLead(req.body.request, currentUser.schoolId, currentUser.id);
    res.status(201).json({ message: "Lead created successfully", data: lead });
  },
);

router.get(
  "/",
  withPermission(Permission.GET_CRM_LEADS),
  validateRequest(listLeadsSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { leads, pagination } = await crmService.listLeads(currentUser.schoolId, req.query, req.query);
    res.json({ message: "Leads retrieved", data: leads, ...pagination });
  },
);

router.get(
  "/funnel",
  withPermission(Permission.GET_CRM_LEADS),
  async (req, res) => {
    const currentUser = req.context.user;
    const stats = await crmService.getFunnelStats(currentUser.schoolId);
    res.json({ message: "Funnel stats retrieved", data: stats });
  },
);

router.get(
  "/:id",
  withPermission(Permission.GET_CRM_LEADS),
  async (req, res) => {
    const currentUser = req.context.user;
    const lead = await crmService.getLeadById(req.params.id, currentUser.schoolId);
    res.json({ message: "Lead retrieved", data: lead });
  },
);

router.patch(
  "/:id",
  withPermission(Permission.UPDATE_CRM_LEAD),
  validateRequest(updateLeadSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const lead = await crmService.updateLead(req.params.id, req.body.request, currentUser.schoolId);
    res.json({ message: "Lead updated", data: lead });
  },
);

router.post(
  "/:id/remarks",
  withPermission(Permission.UPDATE_CRM_LEAD),
  validateRequest(addRemarkSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const remark = await crmService.addRemark(req.params.id, req.body.request.content, currentUser.id, currentUser.schoolId);
    res.status(201).json({ message: "Remark added", data: remark });
  },
);

router.delete(
  "/:id",
  withPermission(Permission.DELETE_CRM_LEAD),
  async (req, res) => {
    const currentUser = req.context.user;
    await crmService.removeLead(req.params.id, currentUser.schoolId, currentUser.id);
    res.json({ message: "Lead deleted" });
  },
);

export default router;
