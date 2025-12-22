-- CreateTable
CREATE TABLE "UserRating" (
    "id" SERIAL NOT NULL,
    "hireRequestId" INTEGER NOT NULL,
    "designerId" INTEGER,
    "reviewerName" TEXT,
    "stars" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRating_hireRequestId_key" ON "UserRating"("hireRequestId");

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_hireRequestId_fkey" FOREIGN KEY ("hireRequestId") REFERENCES "DesignerHireRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
