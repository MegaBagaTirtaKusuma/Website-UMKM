/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procurement` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Production" DROP COLUMN "createdAt",
DROP COLUMN "itemName",
DROP COLUMN "quantity";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "procurement";

-- CreateTable
CREATE TABLE "Procurement" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "supplierName" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionProcurement" (
    "id" SERIAL NOT NULL,
    "productionId" INTEGER NOT NULL,
    "procurementId" INTEGER NOT NULL,

    CONSTRAINT "ProductionProcurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionProcurement_productionId_procurementId_key" ON "ProductionProcurement"("productionId", "procurementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "ProductionProcurement" ADD CONSTRAINT "ProductionProcurement_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionProcurement" ADD CONSTRAINT "ProductionProcurement_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
