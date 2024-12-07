/*
  Warnings:

  - Added the required column `purchaseDate` to the `procurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierName` to the `procurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "procurement" ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "supplierName" TEXT NOT NULL;
