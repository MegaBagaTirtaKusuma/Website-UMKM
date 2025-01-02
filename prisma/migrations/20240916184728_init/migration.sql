-- CreateTable
CREATE TABLE "Procurement" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Procurement_pkey" PRIMARY KEY ("id")
);
