/** @format */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Pastikan Anda sudah mengonfigurasi prisma dengan benar

export async function GET() {
  try {
    // Mendapatkan tanggal terkini
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 - 11

    // Mengambil total pengadaan bulan terkini
    const totalProcurement = await prisma.procurement.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        purchaseDate: {
          gte: new Date(year, month, 1), // Awal bulan terkini
          lt: new Date(year, month + 1, 1), // Awal bulan berikutnya
        },
      },
    });

    // Mengambil nama bulan
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const currentMonthName = monthNames[month];

    return NextResponse.json({
      total: totalProcurement._sum.totalPrice || 0,
      month: currentMonthName,
      year,
    });
  } catch (error) {
    console.error("Error fetching total procurement:", error);
    return NextResponse.error();
  }
}
// Export this to indicate the route is dynamic
export const dynamic = "force-dynamic";
