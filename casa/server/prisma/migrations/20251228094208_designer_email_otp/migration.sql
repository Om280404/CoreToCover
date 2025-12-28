-- CreateTable
CREATE TABLE "DesignerOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignerOtp_email_idx" ON "DesignerOtp"("email");
