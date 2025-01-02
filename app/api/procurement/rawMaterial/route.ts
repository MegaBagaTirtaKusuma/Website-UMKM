import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Import koneksi ke database (Prisma)
import { jwtVerify } from "jose"; // Import untuk verifikasi JWT
import { cookies } from "next/headers"; // Mengambil cookies dari request

// Secret key untuk JWT, yang akan digunakan untuk memverifikasi token
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function GET() {
  try {
    // Ambil token dari cookie 'authToken'
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return NextResponse.json(
        { error: "Token tidak tersedia" },
        { status: 401 }
      );
    }

    const token = tokenCookie.value;

    // Verifikasi token JWT
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    // Pastikan payload dan ID pengguna tersedia dalam decoded token
    const userId = decoded.payload.id;
    if (!userId) {
      return NextResponse.json(
        { error: "ID Pengguna tidak ditemukan dalam token" },
        { status: 401 }
      );
    }

    // Konversi userId menjadi number jika perlu (jika tipe data ID pengguna adalah string)
    const userIdNumber = Number(userId);

    // Ambil data bahan baku dari database (menggunakan Prisma)
    const rawMaterialItems = await prisma.procurement.findMany({
      where: {
        userId: userIdNumber, // Gunakan userId yang sudah dikonversi
        category: "Bahan Baku Produksi",
      },
      select: {
        id: true,
        itemName: true,
        currentQuantity: true,
        unit: true,
      },
      orderBy: {
        id: "desc", // Urutkan berdasarkan ID item secara menurun
      },
    });

    // Kembalikan data bahan baku sebagai respons JSON
    return NextResponse.json(rawMaterialItems, {
      status: 200,
      headers: {
        "Content-Type": "application/json", // Tentukan tipe konten sebagai JSON
        "Cache-Control": "no-store, max-age=0", // Hindari caching
      },
    });
  } catch (error) {
    console.error("Kesalahan saat mengambil item bahan baku:", error);

    // Menangani error lebih spesifik
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Gagal mengambil item bahan baku",
          details: error.message,
        },
        { status: 500 } // Internal Server Error
      );
    }

    // Jika error tidak diketahui, kembalikan error generik
    return NextResponse.json(
      { error: "Kesalahan server internal" },
      { status: 500 }
    );
  }
}

// Export this to indicate the route is dynamic
export const dynamic = "force-dynamic";
