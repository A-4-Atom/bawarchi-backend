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
          feedbacks: true
        }
      }
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
      rating: schedule.item.feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / schedule.item.feedbacks.length || 0,
    });
  }

  res.status(200).json(grouped);
};
