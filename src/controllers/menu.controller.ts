import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { WeekDay } from "@prisma/client"; // Add this import

// Get menu items for a given day, grouped by meal type
export const getMenuByDay = async (req: Request, res: Response) => {
  const { day } = req.params;

  // Validate day input
  const validDays = Object.values(WeekDay);
  if (!validDays.includes(day as WeekDay)) {
    return res.status(400).json({ error: "Invalid day" });
  }

  // Use the enum value for the query
  const schedules = await prisma.menuSchedule.findMany({
    where: { day: day as WeekDay },
    include: {
      item: {
        include: {
          feedbacks: true,
        },
      },
    },
  });

  // Group by meal type
  const grouped: Record<string, any[]> = {};
  for (const schedule of schedules) {
    if (!grouped[schedule.type]) grouped[schedule.type] = [];
    grouped[schedule.type].push({
      id: schedule.item.id,
      name: schedule.item.name,
      price: schedule.item.price,
      rating:
        schedule.item.feedbacks.reduce(
          (acc, feedback) => acc + feedback.rating,
          0
        ) / schedule.item.feedbacks.length || 0,
      description: schedule.item.description,
    });
  }

  res.status(200).json(grouped);
};

// Create a new menu item for a specific day and meal type
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, price, description, day, type } = req.body;
    if (!name || !day || !type) {
      return res
        .status(400)
        .json({ error: "Name, day, and type are required" });
    }
    // Check if item already exists (by name)
    let item = await prisma.menuItem.findFirst({ where: { name } });
    if (!item) {
      item = await prisma.menuItem.create({
        data: { name, price, description },
      });
    }
    // Create schedule for this item/day/type
    const schedule = await prisma.menuSchedule.create({
      data: {
        day,
        type,
        itemId: item.id,
      },
    });
    res.status(201).json({ item, schedule });
  } catch (err) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
};

// Update an existing menu item and/or its schedule
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // menuItem id
    const { name, price, description, day, type } = req.body;

    // Update menu item fields
    const item = await prisma.menuItem.update({
      where: { id },
      data: { name, price, description },
    });

    let schedule = null;
    if (day && type) {
      // Find the schedule for this item, day, and type
      schedule = await prisma.menuSchedule.findFirst({
        where: { itemId: id, day, type },
      });

      if (schedule) {
        // Update the existing schedule if needed
        schedule = await prisma.menuSchedule.update({
          where: { id: schedule.id },
          data: { day, type },
        });
      } else {
        // Or create a new schedule if it doesn't exist
        schedule = await prisma.menuSchedule.create({
          data: { itemId: id, day, type },
        });
      }
    }

    res.json({ item, schedule });
  } catch (err) {
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

// Delete a menu item from a specific day/type (schedule), and optionally the item if not used elsewhere
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // menuItem id
    const { day, type } = req.body;
    if (!day || !type) {
      return res.status(400).json({ error: "day and type are required" });
    }
    // Find the schedule for this item, day, and type
    const schedule = await prisma.menuSchedule.findFirst({
      where: { itemId: id, day, type },
    });
    if (!schedule) {
      return res
        .status(404)
        .json({ error: "Schedule not found for this item, day, and type" });
    }
    // Delete the schedule entry
    await prisma.menuSchedule.delete({ where: { id: schedule.id } });
    // Check if the item is still scheduled elsewhere
    const otherSchedules = await prisma.menuSchedule.findMany({
      where: { itemId: id },
    });
    if (otherSchedules.length === 0) {
      // Safe to delete the menu item itself
      await prisma.menuItem.delete({ where: { id } });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};
