-- AlterTable
ALTER TABLE "Production" ADD COLUMN "productionDate" TIMESTAMP(3) DEFAULT now() NOT NULL;
