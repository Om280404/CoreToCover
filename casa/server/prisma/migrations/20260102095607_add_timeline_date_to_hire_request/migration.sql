/*
  Warnings:

  - You are about to drop the column `timelineDays` on the `DesignerHireRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DesignerHireRequest" DROP COLUMN "timelineDays",
ADD COLUMN     "timelineDate" TIMESTAMP(3);
