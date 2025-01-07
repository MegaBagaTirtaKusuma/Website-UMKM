"use client";

import SalesForm from "@/components/SalesForm";
import SalesTable from "@/components/SalesTable";
import { CardContent } from "@/components/RootCard";

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Tambah Penjualan</p>
          </section>
          <SalesForm />
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">List Penjualan</p>
          </section>
          <SalesTable />
        </CardContent>
      </section>
    </div>
  );
}
