import { Router } from "express";
import {
  createFeedback,
  getFeedbacks,
} from "../controllers/feedback.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
router.post("/", requireAuth, createFeedback);
router.get("/", getFeedbacks);
export default router;
