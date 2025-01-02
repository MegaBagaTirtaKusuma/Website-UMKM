-- DropForeignKey
ALTER TABLE "ProductionProcurement" DROP CONSTRAINT "ProductionProcurement_procurementId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionProcurement" DROP CONSTRAINT "ProductionProcurement_productionId_fkey";

-- AddForeignKey
ALTER TABLE "ProductionProcurement" ADD CONSTRAINT "ProductionProcurement_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionProcurement" ADD CONSTRAINT "ProductionProcurement_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "Procurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
