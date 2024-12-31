// api/sales/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function GET() {
  try {
    const sales = await prisma.sales.findMany({
      include: {
        production: true,
      },
    });

    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      productName: sale.production.productName,
      saleDate: sale.saleDate.toISOString(),
      saleQuantity: sale.saleQuantity,
      salePrice: sale.salePrice,
    }));

    return NextResponse.json(formattedSales);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return new NextResponse("Error fetching sales data", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Data diterima di backend:", data);

    // Destructure and parse the incoming data
    const { productionId, saleQuantity, salePrice, saleDate } = data;

    // Validate required fields
    if (!productionId || !saleQuantity || !salePrice) {
      return new NextResponse("Field yang dibutuhkan tidak lengkap", {
        status: 400,
      });
    }

    // Parse values ensuring they are numbers
    const parsedProductionId = parseInt(productionId, 10);
    const parsedSalePrice = parseInt(salePrice, 10);
    const parsedSaleQuantity = parseFloat(saleQuantity);

    // Calculate totalRevenue
    const totalRevenue = parsedSalePrice * parsedSaleQuantity;

    // Validate parsed values
    if (
      isNaN(parsedProductionId) ||
      isNaN(parsedSalePrice) ||
      isNaN(parsedSaleQuantity) ||
      isNaN(totalRevenue)
    ) {
      return new NextResponse("Field numerik tidak valid", { status: 400 });
    }

    // Verify user token
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token tidak ditemukan", { status: 401 });
    }

    const token = tokenCookie.value;
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const userId = Number(decoded.payload.id);
    if (isNaN(userId)) {
      return new NextResponse("User ID tidak valid", { status: 401 });
    }

    // Use provided saleDate or current date if not provided
    const parsedSaleDate = saleDate ? new Date(saleDate) : new Date();

    // Validate if the date is valid
    if (isNaN(parsedSaleDate.getTime())) {
      return new NextResponse("Format tanggal tidak valid", { status: 400 });
    }

    // Begin transaction
    const transaction = await prisma.$transaction(async (prismaTransaction) => {
      // Check current production quantity
      const production = await prismaTransaction.production.findUnique({
        where: { id: parsedProductionId },
        select: { productionQuantity: true },
      });

      if (!production) {
        throw new Error("Produk tidak ditemukan");
      }

      // Ensure sufficient quantity
      if (production.productionQuantity < parsedSaleQuantity) {
        throw new Error("Jumlah stok produksi tidak mencukupi");
      }

      // Reduce production quantity
      const updatedProduction = await prismaTransaction.production.update({
        where: { id: parsedProductionId },
        data: {
          productionQuantity:
            production.productionQuantity - parsedSaleQuantity,
        },
        select: { productionQuantity: true }, // Return updated quantity
      });

      // Create the sale record
      const sale = await prismaTransaction.sales.create({
        data: {
          productionId: parsedProductionId,
          saleQuantity: parsedSaleQuantity,
          salePrice: parsedSalePrice,
          saleDate: parsedSaleDate,
          userId: userId,
          totalRevenue: totalRevenue,
        },
      });

      // Return sale record and updated stock
      return { sale, updatedProduction };
    });

    console.log("Data penjualan berhasil disimpan:", transaction);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Error saat menyimpan data penjualan:",
        error.message || error
      );
      return new NextResponse(
        error.message || "Terjadi kesalahan saat menyimpan data penjualan",
        {
          status:
            error.message === "Jumlah stok produksi tidak mencukupi"
              ? 400
              : 500,
        }
      );
    } else {
      console.error("Unknown error:", error);
      return new NextResponse("Terjadi kesalahan yang tidak terduga", {
        status: 500,
      });
    }
  }
}
