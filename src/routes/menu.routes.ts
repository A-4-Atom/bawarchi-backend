import { Router } from "express";
import { getMenuByDay } from "../controllers/menu.controller";

const router = Router();
router.get("/:day", getMenuByDay);
export default router;
