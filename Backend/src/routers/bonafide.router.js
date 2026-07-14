import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import bonafideService from "../services/bonafide.service.js";
import generateBonafideSchema from "../schemas/bonafide/generate-bonafide.schema.js";

const router = Router();

router.post(
  "/generate",
  withPermission(Permission.GENERATE_BONAFIDE),
  validateRequest(generateBonafideSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { studentId, purpose } = req.body.request;
    const { buffer, certificate, certNumber } = await bonafideService.generatePdf(
      studentId,
      currentUser.schoolId,
      purpose,
      currentUser.id,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="bonafide-${certNumber}.pdf"`);
    res.send(buffer);
  },
);

router.get(
  "/",
  withPermission(Permission.GET_BONAFIDE_CERTIFICATES),
  async (req, res) => {
    const currentUser = req.context.user;
    const { certificates, pagination } = await bonafideService.listCertificates(currentUser.schoolId, req.query);
    res.json({ message: "Certificates retrieved", data: certificates, ...pagination });
  },
);

export default router;
