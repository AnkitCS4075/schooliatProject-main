/**
 * Mobile API alias: GET /students and GET /students/:id.
 * Forwards to the same handlers as /users/students (user.router).
 */
import { Router } from "express";
import userRouter from "./user.router.js";

const router = Router();

router.get("/", (req, res, next) => {
  req.url = "/students";
  userRouter.handle(req, res, next);
});

router.get("/:id", (req, res, next) => {
  req.url = `/students/${req.params.id}`;
  userRouter.handle(req, res, next);
});

export default router;
