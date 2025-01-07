// api/procurement/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
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

// GET - Fetch procurement data for authenticated user
export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    // Fetch all procurement data from DB for the specific user
    const procurementData = await prisma.procurement.findMany({
      where: { userId },
      include: { item: true },
      orderBy: { purchaseDate: "desc" },
    });

    return NextResponse.json(procurementData, { status: 200 });
  } catch (error) {
    console.error("Error fetching procurement data:", error);
    return new NextResponse("Error fetching procurement data", { status: 500 });
  }
}

// POST - Save new procurement data to the database
export async function POST(req: Request) {
  try {
    const data: {
      itemId: number;
      initialQuantity: string | number;
      totalPrice: string | number;
      supplierName?: string;
      purchaseDate: string;
    } = await req.json();

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    // Pastikan userId adalah number
    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      return new NextResponse("ID pengguna tidak valid", { status: 401 });
    }

    // Periksa apakah user dengan ID ini ada
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
    });

    if (!user) {
      return new NextResponse("Pengguna tidak ditemukan", { status: 404 });
    }

    const { itemId, initialQuantity, totalPrice, supplierName, purchaseDate } =
      data;

    if (
      !itemId ||
      initialQuantity == null ||
      totalPrice == null ||
      !purchaseDate
    ) {
      return new NextResponse(
        "ItemId, initialQuantity, totalPrice, dan purchaseDate wajib diisi",
        { status: 400 }
      );
    }

    // Convert initialQuantity and totalPrice to numbers
    const parsedInitialQuantity = parseFloat(initialQuantity as string);
    const parsedTotalPrice = parseFloat(totalPrice as string);

    if (isNaN(parsedInitialQuantity) || isNaN(parsedTotalPrice)) {
      return new NextResponse(
        "Initial quantity dan total harga harus berupa angka yang valid",
        { status: 400 }
      );
    }

    const parsedPurchaseDate = new Date(purchaseDate);
    if (isNaN(parsedPurchaseDate.getTime())) {
      return new NextResponse("Tanggal pembelian tidak valid", { status: 400 });
    }

    // Check if the item exists
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return new NextResponse("Bahan tidak ditemukan", { status: 404 });
    }

    // Create new procurement entry
    const newProcurement = await prisma.$transaction(async (tx) => {
      // Cari procurement terakhir untuk item ini untuk mendapatkan currentQuantity terkini
      const lastProcurement = await tx.procurement.findFirst({
        where: {
          itemId,
          userId: userIdNumber,
        },
        orderBy: {
          id: "desc",
        },
      });

      // Hitung currentQuantity baru
      const currentStockQuantity = lastProcurement?.currentQuantity || 0;
      const newCurrentQuantity = currentStockQuantity + parsedInitialQuantity;

      // Buat procurement baru
      const procurement = await tx.procurement.create({
        data: {
          itemId,
          initialQuantity: parsedInitialQuantity,
          currentQuantity: newCurrentQuantity, // Set ke total stok baru
          totalPrice: parsedTotalPrice,
          supplierName: supplierName || null,
          purchaseDate: parsedPurchaseDate,
          userId: userIdNumber,
        },
        include: { item: true },
      });

      // Update currentQuantity untuk semua procurement dengan itemId yang sama
      await tx.procurement.updateMany({
        where: {
          itemId,
          userId: userIdNumber,
        },
        data: {
          currentQuantity: newCurrentQuantity,
        },
      });

      // Ambil procurement yang sudah diupdate
      const updatedProcurement = await tx.procurement.findUnique({
        where: { id: procurement.id },
        include: { item: true },
      });

      return updatedProcurement;
    });

    return NextResponse.json(newProcurement, { status: 201 });
  } catch (error) {
    console.error("Error menyimpan pengadaan:", error);
    return new NextResponse("Error menyimpan pengadaan", { status: 500 });
  }
}
// DELETE - Delete procurement data by ID
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID tidak ditemukan", { status: 400 });
    }

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    // Get the procurement to be deleted
    const procurementToDelete = await prisma.procurement.findUnique({
      where: { id: Number(id) },
    });

    if (!procurementToDelete) {
      return new NextResponse("Pengadaan tidak ditemukan", { status: 404 });
    }

    // Delete related production items first (to avoid foreign key constraint violation)
    await prisma.productionItem.deleteMany({
      where: {
        procurementId: Number(id),
      },
    });

    // Delete procurement record
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const deletedProcurement = await prisma.procurement.delete({
      where: {
        id: Number(id),
        userId: userId, // Ensure only the authorized user can delete
      },
    });

    // Update currentQuantity for remaining procurements of this item
    await prisma.procurement.updateMany({
      where: {
        itemId: procurementToDelete.itemId,
        userId: userId,
        id: { not: Number(id) },
      },
      data: {
        currentQuantity: {
          decrement: procurementToDelete.initialQuantity,
        },
      },
    });

    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error menghapus pengadaan:", error);
    return new NextResponse("Error menghapus pengadaan", { status: 500 });
  }
}
