/**
 * Mobile API alias: /employees CRUD.
 * Forwards to the same handlers as /users/employees (user.router).
 */
import { Router } from "express";
import userRouter from "./user.router.js";

const router = Router();

router.get("/", (req, res, next) => {
  req.url = "/employees";
  userRouter.handle(req, res, next);
});

router.get("/:id", (req, res, next) => {
  req.url = `/employees/${req.params.id}`;
  userRouter.handle(req, res, next);
});

router.post("/", (req, res, next) => {
  req.url = "/employees";
  userRouter.handle(req, res, next);
});

router.patch("/:id", (req, res, next) => {
  req.url = `/employees/${req.params.id}`;
  userRouter.handle(req, res, next);
});

router.put("/:id", (req, res, next) => {
  req.url = `/employees/${req.params.id}`;
  userRouter.handle(req, res, next);
});

router.delete("/:id", (req, res, next) => {
  req.url = `/employees/${req.params.id}`;
  userRouter.handle(req, res, next);
});

export default router;
