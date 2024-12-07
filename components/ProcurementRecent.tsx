"use client";
//ProcurementRecent.tsx
import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../lib/utils"; // Import fungsi fetchWithAuth yang sudah ada

export type ProcurementProps = {
  id: number;
  itemName: string;
  supplierName: string;
  totalPrice: number; // Ubah tipe dari string ke number
};

const ProcurementRecent: React.FC = () => {
  const [procurements, setProcurements] = useState<ProcurementProps[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProcurements() {
      try {
        // Mengambil data dengan fetchWithAuth (menambahkan token otomatis)
        const response = await fetchWithAuth("/api/procurement/recent", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recent procurements");
        }

        // Menambahkan tipe data untuk hasil JSON
        const data: ProcurementProps[] = await response.json();
        setProcurements(data); // Mengatur data yang sudah difilter
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
          key={procurement.id} // Menggunakan id sebagai kunci unik
          className="flex flex-wrap justify-between gap-3"
        >
          <section className="flex justify-between gap-3">
            <div className="text-sm">
              <p>{procurement.itemName}</p>
              <div className="text-ellipsis overflow-hidden whitespace-nowrap w-[120px] sm:w-auto text-gray-400">
                {procurement.supplierName}
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
