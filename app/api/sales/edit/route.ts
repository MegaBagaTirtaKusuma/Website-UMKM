import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID penjualan tidak diberikan", { status: 400 });
    }

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    let decoded;
    try {
      decoded = await jwtVerify(tokenCookie.value, SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId) {
      return new NextResponse("ID pengguna tidak ditemukan dalam token", {
        status: 401,
      });
    }

    const salesData = await prisma.sales.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
      include: {
        production: true,
      },
    });

    if (!salesData) {
      return new NextResponse("Data penjualan tidak ditemukan", {
        status: 404,
      });
    }

    const result = {
      ...salesData,
      saleDate: salesData.saleDate.toISOString().split("T")[0],
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data penjualan:", error);
    return new NextResponse("Error mengambil data penjualan", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data: {
      id: number;
      productionId: number;
      saleQuantity: number | string;
      salePrice: number | string;
      saleDate: string;
    } = await req.json();

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    let decoded;
    try {
      decoded = await jwtVerify(tokenCookie.value, SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId) {
      return new NextResponse("ID pengguna tidak ditemukan dalam token", {
        status: 401,
      });
    }

    const { id, productionId, saleQuantity, salePrice, saleDate } = data;

    if (!id || !productionId || !saleQuantity || !salePrice || !saleDate) {
      return new NextResponse(
        "ID, productionId, saleQuantity, salePrice, dan tanggal penjualan wajib diisi",
        { status: 400 }
      );
    }

    // Verifikasi kepemilikan data penjualan
    const existingSale = await prisma.sales.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId),
      },
    });

    if (!existingSale) {
      return new NextResponse("Data penjualan tidak ditemukan", {
        status: 404,
      });
    }

    // Verifikasi production dimiliki oleh user yang sama
    const production = await prisma.production.findFirst({
      where: {
        id: Number(productionId),
        userId: Number(userId),
      },
    });

    if (!production) {
      return new NextResponse("Data produksi tidak ditemukan", { status: 404 });
    }

    const parsedSaleDate = new Date(saleDate);
    if (isNaN(parsedSaleDate.getTime())) {
      return new NextResponse("Format tanggal penjualan tidak valid", {
        status: 400,
      });
    }

    const parsedSaleQuantity = parseFloat(saleQuantity.toString());
    const parsedSalePrice = parseFloat(salePrice.toString());

    if (isNaN(parsedSaleQuantity) || parsedSaleQuantity <= 0) {
      return new NextResponse("Jumlah penjualan harus lebih dari 0", {
        status: 400,
      });
    }

    if (isNaN(parsedSalePrice) || parsedSalePrice <= 0) {
      return new NextResponse("Harga jual harus lebih dari 0", {
        status: 400,
      });
    }

    // Hitung selisih stok
    const stockDifference = existingSale.saleQuantity - parsedSaleQuantity;

    // Verifikasi stok mencukupi jika menambah jumlah penjualan
    if (stockDifference < 0) {
      const availableStock = production.productionQuantity;
      if (Math.abs(stockDifference) > availableStock) {
        return new NextResponse("Stok produk tidak mencukupi", { status: 400 });
      }
    }

    // Hitung total pendapatan
    const totalRevenue = parsedSaleQuantity * parsedSalePrice;

    // Gunakan transaksi untuk memastikan konsistensi data
    const updatedSales = await prisma.$transaction(async (tx) => {
      // Update stok produksi
      await tx.production.update({
        where: {
          id: Number(productionId),
          userId: Number(userId),
        },
        data: {
          productionQuantity: {
            increment: stockDifference,
          },
        },
      });

      // Update data penjualan
      return await tx.sales.update({
        where: {
          id: Number(id),
          userId: Number(userId),
        },
        data: {
          productionId: Number(productionId),
          saleQuantity: parsedSaleQuantity,
          salePrice: parsedSalePrice,
          totalRevenue,
          saleDate: parsedSaleDate,
        },
      });
    });

    return NextResponse.json(updatedSales, { status: 200 });
  } catch (error: unknown) {
    console.error("Error mengubah penjualan:", error);
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        return new NextResponse("Data penjualan sudah ada", { status: 400 });
      }
    }
    return new NextResponse("Error mengubah penjualan", { status: 500 });
  }
}
