/*
  Warnings:

  - Made the column `userId` on table `DesignerHireRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DesignerHireRequest" ALTER COLUMN "userId" SET NOT NULL;
