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

    // Ambil data procurement dengan grouping berdasarkan itemId
    const lowStockItems = await prisma.procurement.groupBy({
      by: ["itemId"],
      where: {
        currentQuantity: {
          lte: 2,
        },
        item: {
          category: "Bahan Baku Produksi",
        },
        userId: Number(userId),
      },
      _min: {
        currentQuantity: true,
      },
    });

    // Ambil detail item untuk setiap itemId yang unique
    const itemDetails = await Promise.all(
      lowStockItems.map(async (item) => {
        const itemDetail = await prisma.item.findUnique({
          where: { id: item.itemId },
          select: {
            itemName: true,
            unit: true,
          },
        });

        return {
          id: item.itemId,
          currentQuantity: item._min.currentQuantity || 0,
          item: {
            itemName: itemDetail?.itemName || "",
            unit: itemDetail?.unit,
          },
        };
      })
    );

    return NextResponse.json(itemDetails);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return new NextResponse("Error fetching low stock items", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
