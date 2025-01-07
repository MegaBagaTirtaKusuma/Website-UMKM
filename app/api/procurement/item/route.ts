// api/procurement/item/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { Prisma } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// JWT Secret key
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// Fungsi untuk memverifikasi token
async function verifyToken(token: string) {
  try {
    const decoded = await jwtVerify(token, SECRET);
    return decoded.payload.id;
  } catch (err) {
    console.error("Token tidak valid:", err);
    return null;
  }
}

// GET - Mengambil semua item milik user
export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak disediakan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const items = await prisma.item.findMany({
      where: { userId: Number(userId) },
    });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error saat mengambil bahan:", error);
    return new NextResponse("Error saat mengambil bahan", { status: 500 });
  }
}

// POST - Membuat item baru
export async function POST(req: Request) {
  try {
    const data: {
      itemName: string;
      category: string;
      unit?: string;
    } = await req.json();

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak disediakan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      return new NextResponse("UserId tidak valid", { status: 400 });
    }

    const { itemName, category, unit } = data;

    if (!itemName || !category) {
      return new NextResponse("Nama bahan dan kategori wajib diisi", {
        status: 400,
      });
    }

    // Cek apakah item dengan nama yang sama sudah ada
    const existingItem = await prisma.item.findFirst({
      where: {
        itemName: {
          equals: itemName,
          mode: "insensitive", // Case insensitive search
        },
        userId: userIdNumber,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        {
          error:
            "Nama bahan sudah ada untuk user ini. Silakan gunakan nama lain.",
        },
        { status: 400 }
      );
    }

    // Buat item baru
    const item = await prisma.item.create({
      data: {
        itemName: itemName.trim(), // Hapus spasi di awal dan akhir
        category,
        unit: unit || null,
        userId: userIdNumber,
      },
    });

    return NextResponse.json(
      {
        message: "Bahan berhasil ditambahkan",
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error detail:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Nama bahan sudah ada. Silakan gunakan nama lain.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menyimpan bahan",
      },
      { status: 500 }
    );
  }
}

// PUT - Memperbarui item yang ada
export async function PUT(req: Request) {
  try {
    const data: {
      id: number;
      itemName?: string;
      category?: string;
      unit?: string;
    } = await req.json();

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak disediakan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const { id, itemName, category, unit } = data;

    if (!id) {
      return new NextResponse("ID bahan wajib diisi", { status: 400 });
    }

    // Periksa apakah item milik user yang sedang login
    const existingItem = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem || existingItem.userId !== Number(userId)) {
      return new NextResponse(
        "Bahan tidak ditemukan atau Anda tidak memiliki izin untuk mengedit",
        { status: 403 }
      );
    }

    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        itemName,
        category,
        unit,
      },
    });

    console.log("Bahan berhasil diperbarui:", updatedItem);
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error saat memperbarui bahan:", error);
    return new NextResponse("Error saat memperbarui bahan", { status: 500 });
  }
}

// DELETE - Menghapus item
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID tidak disediakan", { status: 400 });
    }

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak disediakan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    // Periksa apakah item milik user yang sedang login
    const existingItem = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem || existingItem.userId !== Number(userId)) {
      return new NextResponse(
        "Bahan tidak ditemukan atau Anda tidak memiliki izin untuk menghapus",
        { status: 403 }
      );
    }

    // Periksa apakah item digunakan dalam procurement
    const procurementCount = await prisma.procurement.count({
      where: { itemId: Number(id) },
    });

    if (procurementCount > 0) {
      return new NextResponse(
        "Tidak dapat menghapus bahan karena digunakan dalam pengadaan",
        { status: 400 }
      );
    }

    const deletedItem = await prisma.item.delete({
      where: { id: Number(id) },
    });

    console.log("Bahan berhasil dihapus:", deletedItem);
    return NextResponse.json(
      { message: "Bahan berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat menghapus bahan:", error);
    return new NextResponse("Error saat menghapus bahan", { status: 500 });
  }
}
