/*
  Warnings:

  - You are about to drop the column `otp` on the `SellerOtp` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `SellerOtp` table. All the data in the column will be lost.
  - Added the required column `email` to the `SellerOtp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpHash` to the `SellerOtp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellerOtp" DROP COLUMN "otp",
DROP COLUMN "phone",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "otpHash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SellerOtp_email_idx" ON "SellerOtp"("email");
