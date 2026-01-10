-- CreateTable
CREATE TABLE "DesignerRating" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "hireRequestId" INTEGER NOT NULL,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesignerRating_hireRequestId_key" ON "DesignerRating"("hireRequestId");

-- AddForeignKey
ALTER TABLE "DesignerRating" ADD CONSTRAINT "DesignerRating_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignerRating" ADD CONSTRAINT "DesignerRating_hireRequestId_fkey" FOREIGN KEY ("hireRequestId") REFERENCES "DesignerHireRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
