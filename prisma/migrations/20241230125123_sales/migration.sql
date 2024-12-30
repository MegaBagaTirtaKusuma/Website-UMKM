/*
  Warnings:

  - You are about to drop the column `procurementId` on the `Sales` table. All the data in the column will be lost.
  - You are about to alter the column `salePrice` on the `Sales` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_procurementId_fkey";

-- DropIndex
DROP INDEX "Sales_procurementId_idx";

-- AlterTable
ALTER TABLE "ProductionItem" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Sales" DROP COLUMN "procurementId",
ALTER COLUMN "saleQuantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "salePrice" SET DATA TYPE INTEGER;
