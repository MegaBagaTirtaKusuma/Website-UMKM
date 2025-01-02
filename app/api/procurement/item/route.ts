// api/procurement/item/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
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
    console.error("Error saat mengambil item:", error);
    return new NextResponse("Error saat mengambil item", { status: 500 });
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
      return new NextResponse("Nama item dan kategori wajib diisi", {
        status: 400,
      });
    }

    const item = await prisma.item.create({
      data: {
        itemName,
        category,
        unit: unit || null,
        userId: userIdNumber,
      },
    });

    console.log("Item berhasil dibuat:", item);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error saat membuat item:", error);
    return new NextResponse("Error saat membuat item", { status: 500 });
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
      return new NextResponse("ID item wajib diisi", { status: 400 });
    }

    // Periksa apakah item milik user yang sedang login
    const existingItem = await prisma.item.findUnique({
      where: { id: Number(id) },
    });

    if (!existingItem || existingItem.userId !== Number(userId)) {
      return new NextResponse(
        "Item tidak ditemukan atau Anda tidak memiliki izin untuk mengedit",
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

    console.log("Item berhasil diperbarui:", updatedItem);
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error saat memperbarui item:", error);
    return new NextResponse("Error saat memperbarui item", { status: 500 });
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
        "Item tidak ditemukan atau Anda tidak memiliki izin untuk menghapus",
        { status: 403 }
      );
    }

    // Periksa apakah item digunakan dalam procurement
    const procurementCount = await prisma.procurement.count({
      where: { itemId: Number(id) },
    });

    if (procurementCount > 0) {
      return new NextResponse(
        "Tidak dapat menghapus item karena digunakan dalam procurement",
        { status: 400 }
      );
    }

    const deletedItem = await prisma.item.delete({
      where: { id: Number(id) },
    });

    console.log("Item berhasil dihapus:", deletedItem);
    return NextResponse.json(
      { message: "Item berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saat menghapus item:", error);
    return new NextResponse("Error saat menghapus item", { status: 500 });
  }
}
