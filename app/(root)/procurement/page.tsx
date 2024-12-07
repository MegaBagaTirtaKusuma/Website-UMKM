// app/(root)/procurement/page.tsx
"use client";

import ProcurementForm from "@/components/ProcurementForm";
import ProcurementTable from "@/components/ProcurementTable";
import ProcurementExport from "@/components/ProcurementExport";
import { CardContent } from "@/components/RootCard";

export default function ProcurementPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Tambah Pengadaan</p>
          </section>
          <ProcurementForm />
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">List Pengadaan</p>
          </section>
          <ProcurementTable />
        </CardContent>
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Cetak Pengadaan</p>
          </section>
          <ProcurementExport />
        </CardContent>
      </section>
    </div>
  );
}
