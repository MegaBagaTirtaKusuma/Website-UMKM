// app/(root)/procurement/edit/page.tsx ok
"use client";

import { Suspense } from "react";
import { CardContent } from "@/components/RootCard";
import SalesEdit from "@/components/SalesEdit";

// Halaman untuk Edit Pengadaan
export default function SalesEditPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid grid-cols-1 gap-4 transition-all">
        <CardContent className="flex justify-between gap-4">
          <section className="flex-grow flex justify-center">
            <p className="text-center">Edit Penjualan</p>
          </section>

          {/* Pembungkus Suspense */}
          <Suspense fallback={<div>Loading...</div>}>
            <SalesEdit />
          </Suspense>
        </CardContent>
      </section>
    </div>
  );
}
