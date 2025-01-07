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

    const monthlyTotal = [];

    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

      const total = await prisma.sales.aggregate({
        where: {
          userId,
          saleDate: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
        _sum: {
          totalRevenue: true,
        },
      });

      monthlyTotal.push({
        name: bulanIndonesia[month],
        total: total._sum?.totalRevenue || 0,
      });
    }

    return NextResponse.json(monthlyTotal.reverse());
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return new NextResponse("Error fetching sales data", { status: 500 });
  }
}
