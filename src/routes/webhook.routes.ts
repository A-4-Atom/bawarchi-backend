import express from "express";
import { handleWebhookEvent } from "../controllers/webhook.controller";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), handleWebhookEvent);

export default router;
