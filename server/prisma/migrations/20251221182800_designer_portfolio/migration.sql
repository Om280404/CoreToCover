-- CreateTable
CREATE TABLE "DesignerWork" (
    "id" SERIAL NOT NULL,
    "designerId" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignerWork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DesignerWork" ADD CONSTRAINT "DesignerWork_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
