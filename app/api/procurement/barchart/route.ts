// app/api/procurement/barchart/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { MonthlyProcurement } from "@/@types/MonthlyProcurement";

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

    // Pastikan userId memiliki tipe sesuai schema Prisma
    const userId = parseInt(decoded.payload.id as string, 10); // Mengonversi string ke number
    if (isNaN(userId)) {
      return new NextResponse("User ID tidak valid", { status: 401 });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const monthlyTotal: MonthlyProcurement[] = [];

    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

      const total = await prisma.procurement.aggregate({
        where: {
          userId, // userId sekarang dipastikan tipe number
          purchaseDate: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
        _sum: {
          totalPrice: true,
        },
      });

      monthlyTotal.push({
        name: bulanIndonesia[month],
        total: total._sum?.totalPrice || 0, // Validasi jika _sum undefined
      });
    }

    return NextResponse.json(monthlyTotal.reverse());
  } catch (error) {
    console.error("Error fetching procurement data:", error);
    return new NextResponse("Error fetching procurement data", { status: 500 });
  }
}
