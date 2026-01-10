-- DropForeignKey
ALTER TABLE "DesignerHireRequest" DROP CONSTRAINT "DesignerHireRequest_designerId_fkey";

-- AlterTable
ALTER TABLE "DesignerHireRequest" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "DesignerHireRequest" ADD CONSTRAINT "DesignerHireRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerHireRequest" ADD CONSTRAINT "DesignerHireRequest_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
