"use client";

import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import Card, { CardProps, CardContent } from "@/components/Card";
import BarChart from "@/components/ProcurementBarChart";
import ProcurementRecent from "@/components/ProcurementRecent";
import SalesBarChart from "@/components/SalesBarChart";
import SalesRecent from "@/components/SalesRecent";
import ProfitBarChart from "@/components/ProfitBarchart";

export default function Home() {
  const [loading, setLoading] = useState(true);

const totalProcurement = 3500000;
const totalSales = 7800000;
const salesCount = 48;
const profit = 4300000;

useEffect(() => {
  setLoading(false);
}, []);

  const cardData: CardProps[] = [
    {
      id: "1",
      label: "Pengeluaran",
      amount: `Rp ${totalProcurement.toLocaleString("id-ID")}`,
      discription: "Total pengeluaran bulan ini",
      icon: DollarSign,
    },
    {
      id: "2",
      label: "Pemasukan",
      amount: `Rp ${totalSales.toLocaleString("id-ID")}`,
      discription: "Total pemasukan bulan ini",
      icon: DollarSign,
    },
    {
      id: "3",
      label: "Penjualan",
      amount: salesCount.toString(),
      discription: "Total penjualan bulan ini",
      icon: DollarSign,
    },
    {
      id: "4",
      label: "Laba",
      amount: `Rp ${profit.toLocaleString("id-ID")}`,
      discription: "Total laba bulan ini",
      icon: DollarSign,
    },
  ];

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((d) => (
          <Card key={d.id} {...d} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardContent>
          <p className="p-4 font-semibold">Grafik Pengadaan</p>
          <BarChart />
        </CardContent>

        <CardContent>
          <p className="p-4 font-semibold">Grafik Hasil Penjualan</p>
          <SalesBarChart />
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Pengadaan</p>
            <p className="text-sm text-gray-400">
              Pengadaan terkini bulan ini
            </p>
          </section>
          <ProcurementRecent />
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Penjualan</p>
            <p className="text-sm text-gray-400">
              Penjualan terkini
            </p>
          </section>
          <SalesRecent />
        </CardContent>

        <CardContent>
          <p className="p-4 font-semibold">Grafik Laba</p>
          <ProfitBarChart />
        </CardContent>
      </section>
    </div>
  );
}
