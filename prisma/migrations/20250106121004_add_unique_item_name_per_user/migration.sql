/*
  Warnings:

  - A unique constraint covering the columns `[itemName,userId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Item_itemName_userId_key" ON "Item"("itemName", "userId");
