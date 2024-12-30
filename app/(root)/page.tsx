"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import Card, { CardProps, CardContent } from "@/components/Card";
import BarChart from "@/components/ProcurementBarChart";

import ProcurementRecent from "@/components/ProcurementRecent";

import { SalesProps } from "@/components/SalesCard";

import SalesChart from "@/components/SalesChart";

const cardData: CardProps[] = [
  {
    id: "1",
    label: "Pengeluaran",
    amount: "$45,231.89",
    discription: "Total pengeluaran bulan ini",
    icon: DollarSign,
  },
  {
    id: "2",
    label: "Pemasukan",
    amount: "+2350",
    discription: "Pemasukan bulan ini",
    icon: Users,
  },
  {
    id: "3",
    label: "Penjualan",
    amount: "+1045",
    discription: "Total penjualan bulan ini",
    icon: CreditCard,
  },
  {
    id: "4",
    label: "Cuan",
    amount: "+18,000,000",
    discription: "Total Cuan bulan ini",
    icon: Activity,
  },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [] = useState<number | null>(null);
  const [] = useState<SalesProps[]>([]);
  const [error, setError] = useState<string | null>(null); // Menambahkan state untuk menangani error
  const router = useRouter();

  // Fungsi untuk memeriksa token dan autentikasi pengguna
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken"); // Ambil token dari localStorage
      if (!token) {
        console.error("Authorization token not found in localStorage");
        router.push("/auth/sign-in"); // Pengguna tidak terautentikasi, arahkan ke login
        return;
      }

      try {
        const response = await fetch("/api/auth/validate-token", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Kirim token melalui header Authorization
          },
          credentials: "include", // Kirim cookie bersama request
        });

        if (response.ok) {
          const data = await response.json();
          data.userId;
          setIsAuthenticated(true); // Set status autentikasi berhasil
        } else {
          localStorage.removeItem("authToken"); // Hapus token jika tidak valid
          router.push("/auth/sign-in"); // Arahkan ke halaman login
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setError("Token validation failed. Please try again."); // Menampilkan pesan error
        router.push("/auth/sign-in"); // Gagal memvalidasi token, arahkan ke login
      } finally {
        setLoading(false); // Set loading selesai
      }
    };

    checkAuth();
  }, [router]);

  // Tampilkan loading selama proses autentikasi dan pengambilan data
  if (loading) {
    return <p>Loading...</p>;
  }

  // Jika pengguna tidak terautentikasi, tidak menampilkan konten
  if (!isAuthenticated) {
    return null;
  }

  // Jika ada error, tampilkan pesan error
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {/* Menampilkan data kartu */}
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
        {/* Grafik pengadaan */}
        <CardContent>
          <p className="p-4 font-semibold">Pengadaan</p>
          <BarChart />
        </CardContent>

        {/* Data penjualan pengguna */}
        <CardContent>
          <SalesChart />
        </CardContent>

        {/* Data pengadaan terkini */}
        <CardContent className="flex justify-between gap-4">
          <section>
            <p>Pengadaan</p>
            <p className="text-sm text-gray-400">Pengadaan terkini bulan ini</p>
          </section>
          <ProcurementRecent />
        </CardContent>
        <CardContent>
          <p className="p-4 font-semibold">Penjualan</p>
        </CardContent>
        <CardContent>
          <p className="p-4 font-semibold">Income Bulanan</p>
        </CardContent>
      </section>
    </div>
  );
}
