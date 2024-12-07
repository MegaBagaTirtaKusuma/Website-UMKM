/*
  Warnings:

  - You are about to drop the column `productionDate` on the `Production` table. All the data in the column will be lost.
  - Added the required column `productName` to the `Production` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE "Production" ADD COLUMN "productName" VARCHAR(255) DEFAULT 'default_value';
