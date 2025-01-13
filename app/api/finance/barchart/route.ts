import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

const bulanIndonesia = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const token = tokenCookie.value;
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userId = parseInt(decoded.payload.id as string, 10);
    if (isNaN(userId)) {
      return new NextResponse("User ID tidak valid", { status: 401 });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Mengoptimasi dengan single query untuk 6 bulan sekaligus
    const startDate = new Date(
      currentMonth - 5 < 0 ? currentYear - 1 : currentYear,
      (currentMonth - 5 + 12) % 12,
      1
    );
    const endDate = new Date(currentYear, currentMonth + 1, 1);

    // Query sales dalam satu kali panggilan
    const salesData = await prisma.sales.groupBy({
      by: ["saleDate"],
      where: {
        userId,
        saleDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        totalRevenue: true,
      },
    });

    // Query procurement dalam satu kali panggilan
    const procurementData = await prisma.procurement.groupBy({
      by: ["purchaseDate"],
      where: {
        userId,
        purchaseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    // Memproses data untuk 6 bulan
    const monthlyProfit = [];
    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 1);

      // Menghitung total penjualan untuk bulan ini
      const monthSales = salesData
        .filter((sale) => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= monthStart && saleDate < monthEnd;
        })
        .reduce((sum, sale) => sum + (sale._sum.totalRevenue || 0), 0);

      // Menghitung total pengadaan untuk bulan ini
      const monthProcurement = procurementData
        .filter((proc) => {
          const procDate = new Date(proc.purchaseDate);
          return procDate >= monthStart && procDate < monthEnd;
        })
        .reduce((sum, proc) => sum + (proc._sum.totalPrice || 0), 0);

      monthlyProfit.push({
        name: bulanIndonesia[month],
        total: monthSales - monthProcurement,
      });
    }

    return NextResponse.json(monthlyProfit.reverse());
  } catch (error) {
    console.error("Error fetching profit data:", error);
    return new NextResponse("Error fetching profit data", { status: 500 });
  }
}
