/*
  Warnings:

  - The primary key for the `Designer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Designer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Designer" DROP CONSTRAINT "Designer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Designer_pkey" PRIMARY KEY ("id");
