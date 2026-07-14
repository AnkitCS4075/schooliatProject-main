/**
 * Mobile API alias: GET /notifications and PUT /notifications/:id/read.
 * Forwards to /communication/notifications (communication.router).
 */
import { Router } from "express";
import communicationRouter from "./communication.router.js";

const router = Router();

router.get("/", (req, res, next) => {
  req.url = "/notifications";
  communicationRouter.handle(req, res, next);
});

router.put("/:id/read", (req, res, next) => {
  req.url = `/notifications/${req.params.id}/read`;
  communicationRouter.handle(req, res, next);
});

export default router;
