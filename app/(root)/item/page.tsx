"use client";

import { Suspense, ReactNode } from "react";
import ItemForm from "@/components/ItemForm";
import ItemTable from "@/components/ItemTable";
import ItemEdit from "@/components/ItemEdit";
import { CardContent } from "@/components/RootCard";

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

export default function ProcurementPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Tambah Bahan/Barang</p>
          </section>
          <SuspenseWrapper>
            <ItemForm />
          </SuspenseWrapper>
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">List Bahan</p>
          </section>
          <SuspenseWrapper>
            <ItemTable />
          </SuspenseWrapper>
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Edit Bahan</p>
          </section>
          <SuspenseWrapper>
            <ItemEdit />
          </SuspenseWrapper>
        </CardContent>
      </section>
    </div>
  );
}
