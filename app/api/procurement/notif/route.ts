// api/procurement/notif/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { jwtVerify } from "jose"; // Menggunakan 'jose' untuk verifikasi token JWT
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function GET() {
  try {
    // Mengambil token dari cookie
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      console.error("Token tidak ditemukan");
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const token = tokenCookie.value;
    console.log("Token diterima:", token); // Debugging token

    // Verifikasi token JWT
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    // Ambil userId dari payload token
    const userId = decoded.payload.id;
    if (!userId) {
      console.error("UserId tidak ditemukan dalam token");
      return new NextResponse("ID Pengguna tidak ditemukan dalam token", {
        status: 401,
      });
    }

    console.log("UserId ditemukan:", userId); // Debugging userId

    // Ambil data stok bahan baku dengan kuantitas rendah dari database
    const lowStockItems = await prisma.procurement.findMany({
      where: {
        currentQuantity: {
          lte: 10, // Batas minimum stok
        },
        category: "Bahan Baku Produksi", // Filter hanya untuk kategori "Bahan Baku Produksi"
        userId, // Pastikan hanya mengambil item untuk pengguna yang terautentikasi
      },
      select: {
        id: true,
        itemName: true,
        currentQuantity: true,
      },
    });

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return new NextResponse("Error fetching low stock items", { status: 500 });
  }
}

// Export this to indicate the route is dynamic
export const dynamic = "force-dynamic";
