-- CreateTable
CREATE TABLE "Sales" (
    "id" SERIAL NOT NULL,
    "saleQuantity" INTEGER NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);
