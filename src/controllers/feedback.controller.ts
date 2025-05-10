import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { WeekDay } from "@prisma/client";

// POST /api/feedback
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment, clerkId, itemId } = req.body;
    if (!rating || !clerkId || !itemId) {
      return res
        .status(400)
        .json({ error: "rating, clerkId, and itemId are required" });
    }
    const feedback = await prisma.feedback.create({
      data:{
        rating, comment, user: {connect: {clerkId}}, item: {connect: {id: itemId}},
      }
    })
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Failed to create feedback" });
  }
};

// GET /api/feedback
export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const { day } = req.query;
    if (!day) {
      return res.status(400).json({ error: "day is required" });
    }
    const validDays = Object.values(WeekDay);
    if (!validDays.includes(day as WeekDay)) {
      return res.status(400).json({ error: "Invalid day" });
    }

    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 10;

    const schedules = await prisma.menuSchedule.findMany({
      where: { day: day as WeekDay },
      select: { itemId: true },
    });
    const itemIds = schedules.map(s => s.itemId);
    
    const feedbacks = await prisma.feedback.findMany({
      where: { itemId: { in: itemIds } },
      include: {
        user: { select: { id: true, name: true, email: true } },
        item: { select: { id: true, name: true, price: true } },
      },
      orderBy: { rating: "desc" },
      skip,
      take,
    });

    const mappedFeedbacks = feedbacks.map((fb) => ({
      feedbackId: fb.id,
      rating: fb.rating,
      comment: fb.comment,
      userId: fb.userId,
      itemId: fb.itemId,
      user: {
        userId: fb.user.id,
        name: fb.user.name,
        email: fb.user.email,
      },
      item: {
        itemId: fb.item.id,
        name: fb.item.name,
        price: fb.item.price,
      },
    }));

    res.json(mappedFeedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
};
