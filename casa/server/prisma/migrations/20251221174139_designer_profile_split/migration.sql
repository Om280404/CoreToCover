/*
  Warnings:

  - You are about to drop the column `experience` on the `Designer` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio` on the `Designer` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Designer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Designer" DROP COLUMN "experience",
DROP COLUMN "portfolio",
DROP COLUMN "profileImage";

-- CreateTable
CREATE TABLE "DesignerProfile" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "experience" TEXT,
    "portfolio" TEXT,
    "designerType" TEXT,
    "bio" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignerProfile_designerId_key" ON "DesignerProfile"("designerId");

-- AddForeignKey
ALTER TABLE "DesignerProfile" ADD CONSTRAINT "DesignerProfile_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
