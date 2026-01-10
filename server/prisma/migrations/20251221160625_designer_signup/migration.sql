/*
  Warnings:

  - You are about to drop the column `password` on the `Designer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobile]` on the table `Designer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `passwordHash` to the `Designer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Designer" DROP COLUMN "password",
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "portfolio" TEXT,
ADD COLUMN     "profileImage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Designer_mobile_key" ON "Designer"("mobile");
