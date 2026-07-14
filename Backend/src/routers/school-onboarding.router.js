import { Router } from "express";
import schoolOnboardingService from "../services/school-onboarding.service.js";

const router = Router();

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

router.post("/:id/generate-contract", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const result = await schoolOnboardingService.generateContract(req.params.id, userId);
    res.json({ status: 200, data: result });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/confirm", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.confirmContract(req.params.id, userId);
    res.json({ status: 200, data: item });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/complete", async (req, res, next) => {
  try {
    const userId = req.context.user.id;
    const item = await schoolOnboardingService.complete(req.params.id, userId);
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
