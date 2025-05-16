import { Router } from "express";
import {
  getMenuByDay,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

// Get menu by day
router.get("/:day", getMenuByDay);

// Create menu item (auth required)
router.post("/", requireAuth, createMenuItem);

// Update menu item (auth required)
router.patch("/:id", requireAuth, updateMenuItem);

// Delete menu item (auth required)
router.delete("/:id", requireAuth, deleteMenuItem);

export default router;
