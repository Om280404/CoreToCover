-- CreateTable
CREATE TABLE "SellerDeliveryDetails" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "deliveryResponsibility" TEXT NOT NULL,
    "deliveryCoverage" TEXT NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "deliveryTimeMin" INTEGER,
    "deliveryTimeMax" INTEGER,
    "shippingChargeType" TEXT NOT NULL,
    "shippingCharge" INTEGER,
    "internationalDelivery" BOOLEAN NOT NULL DEFAULT false,
    "installationAvailable" TEXT,
    "installationCharge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerDeliveryDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerDeliveryDetails_sellerId_key" ON "SellerDeliveryDetails"("sellerId");

-- AddForeignKey
ALTER TABLE "SellerDeliveryDetails" ADD CONSTRAINT "SellerDeliveryDetails_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
