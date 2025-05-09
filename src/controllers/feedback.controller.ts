import { Request, Response } from "express";
import { prisma } from "../prisma/client";

// POST /api/feedback
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment, userId, itemId } = req.body;
    if (!rating || !userId || !itemId) {
      return res
        .status(400)
        .json({ error: "rating, userId, and itemId are required" });
    }
    const feedback = await prisma.feedback.create({
      data: { rating, comment, userId, itemId },
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: "Failed to create feedback" });
  }
};

// GET /api/feedback
export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.query;
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 10;
    const where = itemId ? { itemId: itemId as string } : {};
    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        item: {
          select: { id: true, name: true, price: true },
        },
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
