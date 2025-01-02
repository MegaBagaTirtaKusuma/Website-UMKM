"use client";

import PageTitle from "@/components/PageTitle";
import SalesForm from "@/components/SalesForm";
import SalesTable from "@/components/SalesTable";
import { TooltipProvider } from "@/components/ui/tooltip";

interface Props {}

export default function SalesPage({}: Props) {
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5 w-full">
        <PageTitle title="Penjualan" />
        <SalesForm />
        <SalesTable />
      </div>
    </TooltipProvider>
  );
}
