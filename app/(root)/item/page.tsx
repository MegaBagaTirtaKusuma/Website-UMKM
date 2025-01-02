// app/(root)/procurement/page.tsx
"use client";

import ItemForm from "@/components/ItemForm";
import ItemTable from "@/components/ItemTable";
import ItemEdit from "@/components/ItemEdit";
import { CardContent } from "@/components/RootCard";

export default function ProcurementPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Tambah Bahan/Barang</p>
          </section>
          <ItemForm />
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">List Bahan</p>
          </section>
          <ItemTable />
        </CardContent>
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Edit Bahan</p>
          </section>
          <ItemEdit />
        </CardContent>
      </section>
    </div>
  );
}
