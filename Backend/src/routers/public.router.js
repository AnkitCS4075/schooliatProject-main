import { Router } from "express";
import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import schoolOnboardingService from "../services/school-onboarding.service.js";

/**
 * Public (no-auth) endpoints for the school contract acceptance flow.
 * The email sent to a school contains a unique link to this module
 * (`/contract-accept?token=<onboardingId>`), which lets the school view the
 * contract and digitally accept it. Acceptance is timestamped and stored with
 * the email + IP address, then the Super Admin is notified to activate the ID.
 */
const router = Router();

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.trim()) {
    return fwd.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}

// Public: view a school's contract (HTML) + acceptance status
router.get("/contracts/:onboardingId", async (req, res, next) => {
  try {
    const { onboardingId } = req.params;
    const onboarding = await prisma.schoolOnboarding.findFirst({
      where: { id: onboardingId, deletedAt: null },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            contractStatus: true,
            contractAccepted: true,
            contractAcceptedAt: true,
          },
        },
      },
    });
    if (!onboarding) {
      return res.status(404).json({ message: "Contract not found" });
    }
    const contractHtml = schoolOnboardingService.generateContractHtml(onboarding);
    return res.json({
      status: 200,
      data: {
        onboardingId: onboarding.id,
        schoolName: onboarding.schoolName,
        schoolId: onboarding.schoolId,
        pointOfContactName: onboarding.pointOfContactName,
        concernedEmail: onboarding.concernedEmail,
        status: onboarding.status,
        contractStatus: onboarding.school?.contractStatus,
        contractAccepted: onboarding.school?.contractAccepted ?? false,
        contractAcceptedAt: onboarding.contractAcceptedAt,
        acceptedByEmail: onboarding.acceptedByEmail,
        acceptedByIp: onboarding.acceptedByIp,
        acceptedByName: onboarding.acceptedByName,
        contractHtml,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Public: accept the contract (records email/IP/datetime, notifies Super Admin)
router.post("/contracts/:onboardingId/accept", async (req, res, next) => {
  try {
    const { onboardingId } = req.params;
    const body = req.body.request || req.body || {};
    const email = String(body.email || "").trim().toLowerCase();

    const onboarding = await prisma.schoolOnboarding.findFirst({
      where: { id: onboardingId, deletedAt: null },
    });
    if (!onboarding) {
      return res.status(404).json({ message: "Contract not found" });
    }
    if (onboarding.status !== "CONTRACT_SENT") {
      return res.status(400).json({
        message: `Cannot accept contract in status: ${onboarding.status}`,
      });
    }

    const item = await schoolOnboardingService.acceptContract(onboardingId, {
      acceptedBy: "public",
      acceptedAt: body.acceptedAt,
      acceptedByEmail: email || onboarding.concernedEmail,
      acceptedByIp: getClientIp(req),
      acceptedByName: String(body.name || "").trim() || null,
    });

    logger.info(
      { onboardingId, email, ip: getClientIp(req) },
      "Contract accepted via public link",
    );
    return res.json({
      status: 200,
      message: "Contract accepted. The SchooliAT team will activate your account shortly.",
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
