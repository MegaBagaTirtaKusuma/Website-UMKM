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

    const recentProcurements = await prisma.procurement.findMany({
      where: {
        purchaseDate: {
          gte: currentMonthStart,
        },
        userId: Number(userId),
      },
      orderBy: {
        purchaseDate: "desc",
      },
      take: 5,
      include: {
        item: {
          select: {
            itemName: true,
          },
        },
      },
    });

    const formattedProcurements = recentProcurements.map((procurement) => ({
      id: procurement.id,
      item: {
        itemName: procurement.item.itemName,
      },
      supplierName: procurement.supplierName,
      totalPrice: procurement.totalPrice,
      purchaseDate: procurement.purchaseDate,
    }));

    return NextResponse.json(formattedProcurements, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching recent procurements:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch recent procurements",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch recent procurements",
        message: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
