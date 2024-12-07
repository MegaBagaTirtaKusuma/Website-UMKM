"use client";

import PageTitle from "@/components/PageTitle";
import ProductionForm from "@/components/ProductionForm";
import ProductionTable from "@/components/ProductionTable"; // Impor ProductionTable
import { TooltipProvider } from "@/components/ui/tooltip"; // Impor TooltipProvider

interface Props {}

export default function ProductionPage({}: Props) {
  return (
    <TooltipProvider>
      {/* Tambahkan TooltipProvider di sini */}
      <div className="flex flex-col gap-5 w-full">
        <PageTitle title="Produksi" /> {/* Perbarui judul halaman */}
        <ProductionForm /> {/* Gunakan form produksi */}
        <ProductionTable /> {/* Tampilkan tabel produksi */}
      </div>
    </TooltipProvider>
  );
}
