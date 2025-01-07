import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      console.error("Token tidak ditemukan");
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const token = tokenCookie.value;

    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId) {
      console.error("UserId tidak ditemukan dalam token");
      return new NextResponse("ID Pengguna tidak ditemukan dalam token", {
        status: 401,
      });
    }

    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const recentSales = await prisma.sales.findMany({
      where: {
        saleDate: {
          gte: currentMonthStart,
        },
        userId: Number(userId),
      },
      orderBy: {
        saleDate: "desc",
      },
      take: 5,
      include: {
        production: {
          select: {
            productName: true,
          },
        },
      },
    });

    const formattedSales = recentSales.map((sale) => ({
      id: sale.id,
      production: {
        productName: sale.production.productName,
      },
      saleQuantity: sale.saleQuantity,
      totalRevenue: sale.totalRevenue,
      saleDate: sale.saleDate,
    }));

    return NextResponse.json(formattedSales, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching recent sales:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch recent sales",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch recent sales",
        message: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
