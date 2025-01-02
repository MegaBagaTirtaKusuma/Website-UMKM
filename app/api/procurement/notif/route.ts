// api/procurement/notif/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
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
    console.log("Token diterima:", token);

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

    console.log("UserId ditemukan:", userId);

    const lowStockItems = await prisma.procurement.findMany({
      where: {
        currentQuantity: {
          lte: 10,
        },
        item: {
          category: "Bahan Baku Produksi",
        },
        userId: Number(userId),
      },
      select: {
        id: true,
        currentQuantity: true,
        item: {
          select: {
            itemName: true,
            unit: true,
          },
        },
      },
    });

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return new NextResponse("Error fetching low stock items", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
