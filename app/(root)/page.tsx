"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import Card, { CardProps, CardContent } from "@/components/Card";
import BarChart from "@/components/ProcurementBarChart";
import ProcurementRecent from "@/components/ProcurementRecent";
import { SalesProps } from "@/components/SalesCard";
import SalesBarChart from "@/components/SalesBarChart";
import SalesRecent from "@/components/SalesRecent";
import ProfitBarChart from "@/components/ProfitBarchart";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalProcurement, setTotalProcurement] = useState<number>(0);
  const [] = useState<number | null>(null);
  const [] = useState<SalesProps[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [totalSales, setTotalSales] = useState<number>(0);
  const [salesCount, setSalesCount] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);

  // Tambahkan useEffect untuk mengambil jumlah penjualan
  useEffect(() => {
    const fetchSalesCount = async () => {
      try {
        const response = await fetch("/api/sales/count");
        if (response.ok) {
          const data = await response.json();
          setSalesCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching sales count:", error);
      }
    };

    if (isAuthenticated) {
      fetchSalesCount();
    }
  }, [isAuthenticated]);

  // Tambahkan useEffect untuk mengambil total penjualan
  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const response = await fetch("/api/sales/total");
        if (response.ok) {
          const data = await response.json();
          setTotalSales(data.total);
        }
      } catch (error) {
        console.error("Error fetching total sales:", error);
      }
    };

    if (isAuthenticated) {
      fetchTotalSales();
    }
  }, [isAuthenticated]);

  // Fungsi untuk mengambil total procurement
  useEffect(() => {
    const fetchTotalProcurement = async () => {
      try {
        const response = await fetch("/api/procurement/total");
        if (response.ok) {
          const data = await response.json();
          setTotalProcurement(data.total);
        }
      } catch (error) {
        console.error("Error fetching total procurement:", error);
      }
    };

    if (isAuthenticated) {
      fetchTotalProcurement();
    }
  }, [isAuthenticated]);

  // Tambahkan useEffect untuk mengambil data cuan
  useEffect(() => {
    const fetchProfit = async () => {
      try {
        const response = await fetch("/api/finance/profit");
        if (response.ok) {
          const data = await response.json();
          setProfit(data.profit);
        }
      } catch (error) {
        console.error("Error fetching profit:", error);
      }
    };

    if (isAuthenticated) {
      fetchProfit();
    }
  }, [isAuthenticated]);

  // Fungsi untuk memeriksa token dan autentikasi
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Authorization token not found in localStorage");
        router.push("/auth/sign-in");
        return;
      }

      try {
        const response = await fetch("/api/auth/validate-token", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          data.userId;
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          router.push("/auth/sign-in");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setError("Token validation failed. Please try again.");
        router.push("/auth/sign-in");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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
      discription: "Total Pemasukan bulan ini",
      icon: DollarSign,
    },
    {
      id: "3",
      label: "Penjualan",
      amount: `${salesCount.toLocaleString("id-ID")}`,
      discription: "Total penjualan bulan ini",
      icon: DollarSign,
    },
    {
      id: "4",
      label: "Laba",
      amount: `Rp ${profit.toLocaleString("id-ID")}`,
      discription: "Total Laba bulan ini",
      icon: DollarSign,
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated) return null;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((d) => (
          <Card
            key={d.id}
            id={d.id}
            amount={d.amount}
            discription={d.discription}
            icon={d.icon}
            label={d.label}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 transition-all lg:grid-cols-2">
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
            <p className="text-sm text-gray-400">Pengadaan terkini bulan ini</p>
          </section>
          <ProcurementRecent />
        </CardContent>

        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Penjualan</p>
            <p className="text-sm text-gray-400">Penjualan terkini</p>
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
