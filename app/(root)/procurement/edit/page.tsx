// app/(root)/procurement/edit/page.tsx ok
"use client";

import { Suspense } from "react";
import { CardContent } from "@/components/RootCard";
import ProcurementEdit from "@/components/ProcurementEdit";

// Halaman untuk Edit Pengadaan
export default function ProcurementPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Edit Pengadaan</p>
          </section>

          {/* Pembungkus Suspense */}
          <Suspense fallback={<div>Loading...</div>}>
            <ProcurementEdit />
          </Suspense>
        </CardContent>
      </section>
    </div>
  );
}
