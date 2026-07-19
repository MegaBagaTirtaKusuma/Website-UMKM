"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { name: "Jan", total: 1200000 },
  { name: "Feb", total: 1800000 },
  { name: "Mar", total: 1500000 },
  { name: "Apr", total: 2100000 },
  { name: "Mei", total: 1700000 },
  { name: "Jun", total: 2500000 },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function ProcurementBarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => formatRupiah(Number(value))} />
        <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
