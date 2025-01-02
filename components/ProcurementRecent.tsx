"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../lib/utils";

export type ProcurementProps = {
  id: number;
  item: {
    itemName: string;
  };
  supplierName: string | null;
  totalPrice: number;
  purchaseDate: string;
};

const ProcurementRecent: React.FC = () => {
  const [procurements, setProcurements] = useState<ProcurementProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProcurements() {
      try {
        const response = await fetchWithAuth("/api/procurement/recent", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recent procurements");
        }

        const data: ProcurementProps[] = await response.json();
        setProcurements(data.slice(0, 5)); // Memastikan hanya 5 item yang disimpan
      } catch (error) {
        console.error(error);
        setError("Gagal memuat pengadaan terkini");
      }
    }

    fetchProcurements();
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
      {procurements.map((procurement) => (
        <div
          key={procurement.id}
          className="flex flex-wrap justify-between gap-3"
        >
          <section className="flex justify-between gap-3">
            <div className="text-sm">
              <p>{procurement.item.itemName}</p>
              <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[120px] sm:w-auto text-gray-400">
                {procurement.supplierName || "N/A"}
              </div>
            </div>
          </section>
          <p>{formatCurrency(procurement.totalPrice)}</p>
        </div>
      ))}
    </div>
  );
};

export default ProcurementRecent;
