import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export const getMenuByDay = async (req: Request, res: Response) => {
  const { day } = req.params;
  const items = await prisma.menuItem.findMany({ where: { day } });
  res.json(items);
};
