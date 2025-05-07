/*
  Warnings:

  - You are about to drop the column `day` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MenuItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "day",
DROP COLUMN "type",
ALTER COLUMN "price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MenuSchedule" (
    "id" TEXT NOT NULL,
    "day" "WeekDay" NOT NULL,
    "type" "MealType" NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "MenuSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MenuSchedule" ADD CONSTRAINT "MenuSchedule_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
