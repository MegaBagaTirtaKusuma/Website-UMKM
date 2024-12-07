import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose"; // Menggunakan 'jose' untuk verifikasi token JWT
import { cookies } from "next/headers";

// app/api/procurement/recent/route.ts
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

    // Mengambil pengadaan terkini yang terkait dengan userId
    const currentMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const recentProcurements = await prisma.procurement.findMany({
      where: {
        purchaseDate: {
          gte: currentMonthStart, // Mengambil data dari awal bulan terkini
        },
        userId, // Pastikan hanya mengambil data pengadaan untuk user yang terautentikasi
      },
      orderBy: {
        purchaseDate: "desc",
      },
      take: 5, // Batas maksimum 5 pengadaan
    });

    // Filter untuk memastikan tidak ada data yang duplikat berdasarkan 'id'
    const uniqueProcurements = Array.from(
      new Map(recentProcurements.map((item) => [item.id, item])).values()
    );

    return NextResponse.json(uniqueProcurements, { status: 200 });
  } catch (error: unknown) {
    // Menangani error yang tidak terduga
    console.error("Error fetching recent procurements:", error);

    // Periksa jika error adalah instance dari Error
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to fetch recent procurements",
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Jika error bukan instance dari Error, kirimkan pesan error umum
    return NextResponse.json(
      {
        error: "Failed to fetch recent procurements",
        message: "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Export this to indicate the route is dynamic
export const dynamic = "force-dynamic";
