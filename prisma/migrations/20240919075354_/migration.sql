/*
  Warnings:

  - Made the column `productionDate` on table `Production` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Production" ALTER COLUMN "productionDate" SET NOT NULL,
ALTER COLUMN "productionDate" DROP DEFAULT,
ALTER COLUMN "productionDate" SET DATA TYPE TIMESTAMP(3);
