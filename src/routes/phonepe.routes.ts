import { Router } from "express";
import {
  createOrder,
  phonepeWebhook,
  paymentCallback,
} from "../controllers/phonepe.controller";

const router = Router();

router.post("/create-order", createOrder);
router.post("/phonepe-webhook", phonepeWebhook);
router.get("/payment-callback", paymentCallback);

export default router;
