// app/api/procurement/item/edit/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

// Secret key untuk verifikasi JWT
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// Tandai route sebagai dynamic
export const dynamic = "force-dynamic";

// Fungsi untuk mengambil data item berdasarkan ID
export async function GET(req: Request) {
  try {
    // Mendapatkan ID dari URL
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID item tidak diberikan", { status: 400 });
    }

    // Ambil token dari cookie
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const token = tokenCookie.value;

    // Verifikasi token
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId) {
      return new NextResponse("User ID tidak ditemukan di token", {
        status: 401,
      });
    }

    // Ambil data item berdasarkan ID
    const itemData = await prisma.item.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!itemData) {
      return new NextResponse("Data bahan tidak ditemukan", {
        status: 404,
      });
    }

    return NextResponse.json(itemData, { status: 200 });
  } catch (error) {
    console.error("Error fetching bahan data:", error);
    return new NextResponse("Error fetching bahan data", { status: 500 });
  }
}

// Fungsi untuk memperbarui data item
export async function PUT(req: Request) {
  try {
    // Ambil token dari cookie
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const token = tokenCookie.value;

    // Verifikasi token dan dapatkan userId
    let userId: string | null = null;
    try {
      const decoded = await jwtVerify(token, SECRET);
      userId = decoded.payload.id as string;
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    if (!userId) {
      return new NextResponse("User ID tidak ditemukan di token", {
        status: 401,
      });
    }

    const data: {
      id: number;
      itemName: string;
      category: string;
      unit?: string;
    } = await req.json();

    console.log("Data yang diterima untuk update:", data);

    const { id, itemName, category, unit } = data;

    // Validasi input
    if (!id || !itemName || !category) {
      return new NextResponse("ID, nama bahan, dan kategori wajib diisi", {
        status: 400,
      });
    }

    // Cek apakah item dengan nama yang sama sudah ada
    const existingItem = await prisma.item.findFirst({
      where: {
        itemName: {
          equals: itemName,
          mode: "insensitive",
        },
        userId: Number(userId),
        id: {
          not: Number(id),
        },
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          error: `Bahan dengan nama '${itemName}' sudah ada dalam daftar Anda`,
        },
        { status: 400 }
      );
    }

    // Cek apakah item yang akan diupdate ada dan milik user yang benar
    const currentItem = await prisma.item.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
    });

    if (!currentItem) {
      return NextResponse.json(
        {
          error: "Bahan tidak ditemukan atau Anda tidak memiliki akses",
        },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        itemName: itemName.trim(),
        category,
        unit: unit || null,
      },
    });

    return NextResponse.json(
      {
        message: "Bahan berhasil diperbarui",
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error detail:", error); // Untuk debugging

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: `Bahan dengan nama tersebut sudah ada dalam daftar Anda`,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memperbarui bahan. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
