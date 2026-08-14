import { Router } from "express";
import schoolOnboardingService from "../services/school-onboarding.service.js";
import { RoleName } from "../prisma/generated/index.js";

const router = Router();

// The entire onboarding/contracts module is Super Admin only.
router.use((req, res, next) => {
  if (req.context?.user?.role?.name !== RoleName.SUPER_ADMIN) {
    return res.status(403).json({ message: "Only Super Admin can manage school onboarding/contracts." });
  }
  next();
});

router.get("/stats", async (req, res, next) => {
  try {
    const stats = await schoolOnboardingService.getStats();
    res.json({ status: 200, data: stats });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await schoolOnboardingService.list(
      { status, search },
      { page, limit }
    );
    res.json({ status: 200, data: result });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await schoolOnboardingService.getById(req.params.id);
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

// View the contract HTML without regenerating/re-emailing the PDF
router.get("/:id/contract", async (req, res, next) => {
  try {
    const item = await schoolOnboardingService.getContractHtml(req.params.id);
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = req.body.request || req.body;
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.create(data, userId);
    res.status(201).json({ status: 201, data: item });
  } catch (error) {
    next(error);
  }
});

// Generate contract PDF, store it, and email it to the school
router.post("/:id/generate-contract", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const result = await schoolOnboardingService.generateContract(req.params.id, userId);
    res.json({ status: 200, data: result });
  } catch (error) {
    next(error);
  }
});

// School accepts the contract digitally (records acceptance + notifies team to activate)
router.post("/:id/accept-contract", async (req, res, next) => {
  try {
    const body = req.body.request || req.body;
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.acceptContract(req.params.id, {
      acceptedBy: userId,
      acceptedAt: body.acceptedAt,
    });
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

// Legacy alias for accept-contract
router.post("/:id/confirm", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.acceptContract(req.params.id, {
      acceptedBy: userId,
    });
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

// Complete onboarding: create School + admin credentials, email credentials
router.post("/:id/complete", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.complete(req.params.id, userId);
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

// Super Admin activates the school account
router.post("/:id/activate", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.activateSchool(req.params.id, userId);
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/cancel", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.cancel(req.params.id, userId);
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    await schoolOnboardingService.remove(req.params.id, userId);
    res.json({ status: 200, message: "Onboarding deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
