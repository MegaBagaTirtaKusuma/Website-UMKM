/*
  Warnings:

  - You are about to drop the column `category` on the `Procurement` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `Procurement` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Procurement` table. All the data in the column will be lost.
  - Added the required column `itemId` to the `Procurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Procurement" DROP COLUMN "category",
DROP COLUMN "itemName",
DROP COLUMN "unit",
ADD COLUMN     "itemId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProductionItem" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sales" (
    "id" SERIAL NOT NULL,
    "saleQuantity" DOUBLE PRECISION NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "productionId" INTEGER NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sales_userId_idx" ON "Sales"("userId");

-- CreateIndex
CREATE INDEX "Sales_productionId_idx" ON "Sales"("productionId");

-- AddForeignKey
ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
