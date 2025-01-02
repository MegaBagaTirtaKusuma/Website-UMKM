"use client";

import { Suspense } from "react";
import ItemEdit from "@/components/ItemEdit";
import { CardContent } from "@/components/RootCard";

function ItemEditWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ItemEdit />
    </Suspense>
  );
}

export default function ProcurementPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Edit Bahan/Barang</p>
          </section>
          <ItemEditWrapper />
        </CardContent>
      </section>
    </div>
  );
}
