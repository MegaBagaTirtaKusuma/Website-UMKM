"use client";
import { fetchWithAuth } from "../lib/utils";
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

type MonthlySales = {
  name: string;
  total: number;
};

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const SalesBarChart: React.FC = () => {
  const [data, setData] = useState<MonthlySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth("/api/sales/barchart", {
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

        const result: MonthlySales[] = await response.json();
        setData(result);
      } catch (error) {
        console.error("Kesalahan saat mengambil data penjualan:", error);
        setError("Gagal memuat data penjualan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          fill="black" // Warna hijau untuk membedakan dengan procurement
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

export default SalesBarChart;
