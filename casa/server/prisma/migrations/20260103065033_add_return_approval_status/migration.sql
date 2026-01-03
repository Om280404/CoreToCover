/*
  Warnings:

  - You are about to drop the column `decidedAt` on the `ReturnRequest` table. All the data in the column will be lost.
  - You are about to drop the column `decidedBy` on the `ReturnRequest` table. All the data in the column will be lost.
  - You are about to drop the column `decisionNote` on the `ReturnRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ReturnRequest` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ReturnRequest" DROP COLUMN "decidedAt",
DROP COLUMN "decidedBy",
DROP COLUMN "decisionNote",
DROP COLUMN "status",
ADD COLUMN     "adminApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "adminApprovedAt" TIMESTAMP(3),
ADD COLUMN     "adminDecisionNote" TEXT,
ADD COLUMN     "sellerApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "sellerApprovedAt" TIMESTAMP(3),
ADD COLUMN     "sellerDecisionNote" TEXT;
