import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import bonafideService from "../services/bonafide.service.js";
import generateBonafideSchema from "../schemas/bonafide/generate-bonafide.schema.js";
import previewBonafideSchema from "../schemas/bonafide/preview-bonafide.schema.js";

const router = Router();

router.post(
  "/generate",
  withPermission(Permission.GENERATE_BONAFIDE),
  validateRequest(generateBonafideSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { studentId, purpose, isDuplicate } = req.body.request;
    const { buffer, certNumber } = await bonafideService.generatePdf({
      studentId,
      schoolId: currentUser.schoolId,
      purpose,
      userId: currentUser.id,
      isDuplicate,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="bonafide-${certNumber}.pdf"`);
    res.send(buffer);
  },
);

router.post(
  "/preview",
  withPermission(Permission.GENERATE_BONAFIDE),
  validateRequest(previewBonafideSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { studentId, purpose, isDuplicate } = req.body.request;
    const { html, certificateNumber } = await bonafideService.getPreview({
      studentId,
      schoolId: currentUser.schoolId,
      purpose,
      isDuplicate,
    });
    res.json({ message: "Preview generated", data: { html, certificateNumber } });
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

router.get(
  "/:id/pdf",
  withPermission(Permission.GET_BONAFIDE_CERTIFICATES),
  async (req, res) => {
    const currentUser = req.context.user;
    const { buffer, certNumber } = await bonafideService.getCertificatePdf({
      certificateId: req.params.id,
      schoolId: currentUser.schoolId,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="bonafide-${certNumber}.pdf"`);
    res.send(buffer);
  },
);

export default router;
