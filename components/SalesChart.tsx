"use client";

import { useEffect, useState, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SalesData {
  saleDate: string;
  saleQuantity: number;
}

const SalesChart = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  const updateMonthlyChart = useCallback(
    (data: SalesData[]) => {
      const filteredData = data.filter((item) => {
        const date = new Date(item.saleDate);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() + 1 === selectedMonth
        );
      });

      const dailyGroupedData = filteredData.reduce(
        (acc: Record<string, number>, item: SalesData) => {
          const date = new Date(item.saleDate);
          const day = date.getDate();
          acc[day] = (acc[day] || 0) + item.saleQuantity;
          return acc;
        },
        {}
      );

      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const dailyData = dailyLabels.map((day) => dailyGroupedData[day] || 0);

      setChartData({
        labels: dailyLabels,
        datasets: [
          {
            label: `Jumlah Penjualan pada ${selectedMonth}/${selectedYear}`,
            data: dailyData,
            borderColor: "rgb(75, 192, 192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
          },
        ],
      });
    },
    [selectedYear, selectedMonth]
  );

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch("/api/sales");
        if (response.ok) {
          const result: SalesData[] = await response.json();
          updateMonthlyChart(result);
        } else {
          console.error("Failed to fetch sales data. Status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchSalesData();
  }, [selectedYear, selectedMonth, updateMonthlyChart]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="p-6 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">
        Grafik Penjualan Bulanan ({selectedMonth}/{selectedYear})
      </h2>
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="year">
            Pilih Tahun
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-2 border rounded"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="month">
            Pilih Bulan
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 border rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: `Tren Penjualan Bulanan (${selectedMonth}/${selectedYear})`,
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Tanggal",
              },
            },
            y: {
              title: {
                display: true,
                text: "Jumlah Penjualan",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default SalesChart;
