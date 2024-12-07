/*
  Warnings:

  - You are about to drop the `Procurement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Procurement";

-- CreateTable
CREATE TABLE "procurement" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "procurement_pkey" PRIMARY KEY ("id")
);
