/*
  Warnings:

  - Added the required column `productionId` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "productionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
