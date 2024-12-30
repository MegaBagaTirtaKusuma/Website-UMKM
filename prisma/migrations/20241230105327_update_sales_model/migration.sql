-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_procurementId_fkey";

-- AlterTable
ALTER TABLE "Sales" ALTER COLUMN "procurementId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
