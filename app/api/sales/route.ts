import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

async function verifyToken(token: string) {
  try {
    const decoded = await jwtVerify(token, SECRET);
    return decoded.payload.id;
  } catch (err) {
    console.error("Token tidak valid:", err);
    return null;
  }
}

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

    // Ambil data penjualan dengan filter userId
    const salesData = await prisma.sales.findMany({
      where: {
        userId: Number(userId),
        production: {
          userId: Number(userId), // Filter produksi berdasarkan userId
        },
      },
      include: {
        production: true, // Include semua data production yang sudah difilter di where
      },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json(salesData, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data penjualan:", error);
    return new NextResponse("Error mengambil data penjualan", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data: {
      productionId: number;
      saleQuantity: string | number;
      salePrice: string | number;
      saleDate: string;
    } = await req.json();

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const userId = await verifyToken(tokenCookie.value);
    if (!userId) {
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userIdNumber = Number(userId);
    if (isNaN(userIdNumber)) {
      return new NextResponse("ID pengguna tidak valid", { status: 401 });
    }

    const { productionId, saleQuantity, salePrice, saleDate } = data;

    if (!productionId || !saleQuantity || !salePrice || !saleDate) {
      return new NextResponse(
        "ProductionId, saleQuantity, salePrice, dan saleDate wajib diisi",
        { status: 400 }
      );
    }

    // Verifikasi bahwa produksi dimiliki oleh user yang sama
    const production = await prisma.production.findFirst({
      where: {
        id: productionId,
        userId: userIdNumber, // Pastikan produksi milik user yang sama
      },
    });

    if (!production) {
      return new NextResponse("Produk tidak ditemukan", { status: 404 });
    }

    // Konversi nilai ke number
    const parsedSaleQuantity = parseFloat(saleQuantity.toString());
    const parsedSalePrice = parseFloat(salePrice.toString());

    if (isNaN(parsedSaleQuantity) || isNaN(parsedSalePrice)) {
      return new NextResponse(
        "Jumlah penjualan dan harga harus berupa angka yang valid",
        { status: 400 }
      );
    }

    const parsedSaleDate = new Date(saleDate);
    if (isNaN(parsedSaleDate.getTime())) {
      return new NextResponse("Tanggal penjualan tidak valid", { status: 400 });
    }

    if (parsedSaleQuantity > production.productionQuantity) {
      return new NextResponse("Stok produk tidak mencukupi", { status: 400 });
    }

    // Hitung total pendapatan
    const totalRevenue = parsedSaleQuantity * parsedSalePrice;

    // Buat entri penjualan baru dengan transaksi
    const newSale = await prisma.$transaction(async (tx) => {
      // Buat record penjualan
      const sale = await tx.sales.create({
        data: {
          productionId,
          saleQuantity: parsedSaleQuantity,
          salePrice: parsedSalePrice,
          totalRevenue,
          saleDate: parsedSaleDate,
          userId: userIdNumber,
        },
        include: {
          production: true, // Tidak perlu where di sini karena sudah difilter di data
        },
      });

      // Update stok produksi
      await tx.production.update({
        where: {
          id: productionId,
          userId: userIdNumber,
        },
        data: {
          productionQuantity: {
            decrement: parsedSaleQuantity,
          },
        },
      });

      return sale;
    });

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error("Error menyimpan penjualan:", error);
    return new NextResponse("Error menyimpan penjualan", { status: 500 });
  }
}

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

    const sale = await prisma.sales.findUnique({
      where: { id: Number(id) },
    });

    if (!sale) {
      return new NextResponse("Penjualan tidak ditemukan", { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Hapus record penjualan
      await tx.sales.delete({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
      });

      // Kembalikan stok produksi
      await tx.production.update({
        where: { id: sale.productionId },
        data: {
          productionQuantity: {
            increment: sale.saleQuantity,
          },
        },
      });
    });

    return NextResponse.json(
      { message: "Data berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error menghapus penjualan:", error);
    return new NextResponse("Error menghapus penjualan", { status: 500 });
  }
}
