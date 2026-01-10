-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "deliveryTimeMax" INTEGER,
ADD COLUMN     "deliveryTimeMin" INTEGER,
ADD COLUMN     "installationAvailable" TEXT,
ADD COLUMN     "shippingCharge" INTEGER,
ADD COLUMN     "shippingChargeType" TEXT;
