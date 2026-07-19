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
  { month: "Jan", total: 2500000 },
  { month: "Feb", total: 3000000 },
  { month: "Mar", total: 4100000 },
  { month: "Apr", total: 5200000 },
  { month: "Mei", total: 4900000 },
  { month: "Jun", total: 6100000 },
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
