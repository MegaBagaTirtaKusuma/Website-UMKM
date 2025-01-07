"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../lib/utils";

export type SalesRecentProps = {
  id: number;
  production: {
    productName: string;
  };
  saleQuantity: number;
  totalRevenue: number;
  saleDate: string;
};

const SalesRecent: React.FC = () => {
  const [sales, setSales] = useState<SalesRecentProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await fetchWithAuth("/api/sales/recent", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recent sales");
        }

        const data: SalesRecentProps[] = await response.json();
        setSales(data.slice(0, 5)); // Mengambil 5 data terbaru
      } catch (error) {
        console.error(error);
        setError("Gagal memuat penjualan terkini");
      }
    }

    fetchSales();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {sales.map((sale) => (
        <div key={sale.id} className="flex flex-wrap justify-between gap-3">
          <section className="flex justify-between gap-3">
            <div className="text-sm">
              <p>{sale.production.productName}</p>
              <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[120px] sm:w-auto text-gray-400">
                {sale.saleQuantity} unit
              </div>
            </div>
          </section>
          <p>{formatCurrency(sale.totalRevenue)}</p>
        </div>
      ))}
    </div>
  );
};

export default SalesRecent;
