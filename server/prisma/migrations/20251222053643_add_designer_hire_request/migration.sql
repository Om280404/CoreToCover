-- CreateTable
CREATE TABLE "DesignerHireRequest" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "workType" TEXT NOT NULL,
    "timelineDays" INTEGER,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerHireRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DesignerHireRequest" ADD CONSTRAINT "DesignerHireRequest_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
