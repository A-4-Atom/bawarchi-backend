import { Router } from "express";
import {
  createFeedback,
  getFeedbacks,
} from "../controllers/feedback.controller";

const router = Router();
router.post("/", createFeedback);
router.get("/", getFeedbacks);
export default router;
