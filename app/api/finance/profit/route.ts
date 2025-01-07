import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

async function verifyToken(token: string) {
  try {
    const decoded = await jwtVerify(token, SECRET);
    return decoded.payload.id;
  } catch (err) {
    console.error("Token tidak valid:", err);
    return null;
  }
}

export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    // Dapatkan tanggal awal dan akhir bulan ini
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Hitung total pendapatan dari penjualan bulan ini
    const totalSales = await prisma.sales.aggregate({
      where: {
        userId: Number(userId),
        saleDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalRevenue: true,
      },
    });

    // Hitung total pengeluaran dari pengadaan bulan ini
    const totalProcurement = await prisma.procurement.aggregate({
      where: {
        userId: Number(userId),
        purchaseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const revenue = totalSales._sum.totalRevenue || 0;
    const expense = totalProcurement._sum.totalPrice || 0;
    const profit = revenue - expense;

    return NextResponse.json({ profit }, { status: 200 });
  } catch (error) {
    console.error("Error menghitung cuan:", error);
    return new NextResponse("Error menghitung cuan", { status: 500 });
  }
}
