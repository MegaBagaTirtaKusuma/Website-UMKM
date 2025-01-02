// ProcurementBarChart.tsx
/** @format */
"use client";
import { fetchWithAuth } from "../lib/utils"; // Import fungsi fetchWithAuth seperti di ProcurementTable
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Tipe untuk data pengadaan bulanan
type MonthlyProcurement = {
  name: string;
  total: number;
};

// Fungsi untuk memformat angka ke format rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Komponen BarChart menggunakan React Functional Component
const ProcurementBarChart: React.FC = () => {
  // State untuk menyimpan data pengadaan bulanan
  const [data, setData] = useState<MonthlyProcurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mengambil data dari API saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Menggunakan fetchWithAuth untuk mengambil data dengan token yang valid
        const response = await fetchWithAuth("/api/procurement/barchart", {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error: ${response.status} ${response.statusText}, ${
              errorData.error || ""
            }`
          );
        }

        const result: MonthlyProcurement[] = await response.json();
        setData(result); // Mengatur data yang sudah difilter
      } catch (error) {
        console.error("Kesalahan saat mengambil data pengadaan:", error);
        setError("Gagal memuat data pengadaan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Kosongkan dependency array untuk memastikan hanya dipanggil sekali saat mount

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          hide
        />
        <XAxis dataKey="total" type="number" hide />
        <Tooltip formatter={(value: number) => formatRupiah(value)} />
        <Bar
          dataKey="total"
          fill="black" // Ganti warna batang menjadi hitam
          radius={8}
        >
          <LabelList
            dataKey="name"
            position="insideLeft"
            offset={8}
            fontSize={13}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProcurementBarChart;
