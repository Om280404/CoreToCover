-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "refundAmount" DOUBLE PRECISION,
ADD COLUMN     "refundProcessedAt" TIMESTAMP(3),
ADD COLUMN     "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "returnReason" TEXT,
ADD COLUMN     "returnRequestedAt" TIMESTAMP(3),
ADD COLUMN     "returnResolvedAt" TIMESTAMP(3),
ADD COLUMN     "returnStatus" "ReturnStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "sellerName" TEXT,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "images" TEXT[],
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "decidedBy" TEXT,
    "decisionNote" TEXT,
    "decidedAt" TIMESTAMP(3),
    "refundAmount" DOUBLE PRECISION,
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'NONE',
    "refundDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReturnRequest_orderItemId_key" ON "ReturnRequest"("orderItemId");

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
