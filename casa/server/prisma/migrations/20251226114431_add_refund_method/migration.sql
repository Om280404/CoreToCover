-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('STORE_CREDIT', 'ORIGINAL_PAYMENT');

-- AlterTable
ALTER TABLE "ReturnRequest" ADD COLUMN     "refundMethod" "RefundMethod";
