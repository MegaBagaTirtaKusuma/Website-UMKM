/*
  Warnings:

  - Added the required column `totalRevenue` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "totalRevenue" DOUBLE PRECISION NOT NULL;
