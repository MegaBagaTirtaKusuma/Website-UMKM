/*
  Warnings:

  - You are about to drop the column `quantity` on the `Procurement` table. All the data in the column will be lost.
  - You are about to drop the `Production` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionProcurement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Procurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Procurement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Procurement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductionProcurement" DROP CONSTRAINT "ProductionProcurement_procurementId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionProcurement" DROP CONSTRAINT "ProductionProcurement_productionId_fkey";

-- AlterTable
ALTER TABLE "Procurement" DROP COLUMN "quantity",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "initialQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "supplierName" DROP NOT NULL;

-- DropTable
DROP TABLE "Production";

-- DropTable
DROP TABLE "ProductionProcurement";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
