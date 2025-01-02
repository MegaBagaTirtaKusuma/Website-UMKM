/*
  Warnings:

  - You are about to drop the column `productionDate` on the `Production` table. All the data in the column will be lost.
  - Made the column `productName` on table `Production` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Production" DROP COLUMN "productionDate",
ALTER COLUMN "productName" SET NOT NULL,
ALTER COLUMN "productName" DROP DEFAULT,
ALTER COLUMN "productName" SET DATA TYPE TEXT;
