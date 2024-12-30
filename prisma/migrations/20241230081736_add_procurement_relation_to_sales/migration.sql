/*
  Warnings:

  - Added the required column `procurementId` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "procurementId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Sales_userId_idx" ON "Sales"("userId");

-- CreateIndex
CREATE INDEX "Sales_productionId_idx" ON "Sales"("productionId");

-- CreateIndex
CREATE INDEX "Sales_procurementId_idx" ON "Sales"("procurementId");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
