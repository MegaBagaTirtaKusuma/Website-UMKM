/*
  Warnings:

  - You are about to drop the column `unitPrice` on the `Procurement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Procurement" DROP COLUMN "unitPrice",
ALTER COLUMN "currentQuantity" SET DEFAULT 0,
ALTER COLUMN "currentQuantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "initialQuantity" SET DEFAULT 0,
ALTER COLUMN "initialQuantity" SET DATA TYPE DOUBLE PRECISION;
