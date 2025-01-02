/*
  Warnings:

  - Added the required column `userId` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Procurement_itemId_idx" ON "Procurement"("itemId");

-- CreateIndex
CREATE INDEX "Procurement_userId_idx" ON "Procurement"("userId");

-- CreateIndex
CREATE INDEX "Production_userId_idx" ON "Production"("userId");

-- CreateIndex
CREATE INDEX "ProductionItem_productionId_idx" ON "ProductionItem"("productionId");

-- CreateIndex
CREATE INDEX "ProductionItem_procurementId_idx" ON "ProductionItem"("procurementId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
