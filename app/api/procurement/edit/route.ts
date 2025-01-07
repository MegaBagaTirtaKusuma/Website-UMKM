// app/api/procurement/edit/route.ts
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
      return new NextResponse("ID pengadaan tidak diberikan", { status: 400 });
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

    const procurementData = await prisma.procurement.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        item: true, // Include the related Item data
      },
    });

    if (!procurementData) {
      return new NextResponse("Data pengadaan tidak ditemukan", {
        status: 404,
      });
    }

    const result = {
      ...procurementData,
      purchaseDate: procurementData.purchaseDate.toISOString().split("T")[0],
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error mengambil data pengadaan:", error);
    return new NextResponse("Error mengambil data pengadaan", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data: {
      id: number;
      itemId: number;
      initialQuantity: number | string;
      currentQuantity: number | string;
      totalPrice: number | string;
      supplierName?: string;
      purchaseDate: string;
    } = await req.json();

    const {
      id,
      itemId,
      initialQuantity,
      currentQuantity,
      totalPrice,
      supplierName,
      purchaseDate,
    } = data;

    if (
      !id ||
      !itemId ||
      initialQuantity == null ||
      currentQuantity == null ||
      totalPrice == null ||
      !purchaseDate
    ) {
      return new NextResponse(
        "ID, itemId, initialQuantity, currentQuantity, totalPrice, dan tanggal pembelian wajib diisi",
        { status: 400 }
      );
    }

    const parsedPurchaseDate = new Date(purchaseDate);
    if (isNaN(parsedPurchaseDate.getTime())) {
      return new NextResponse("Format tanggal pembelian tidak valid", {
        status: 400,
      });
    }

    const updatedProcurement = await prisma.procurement.update({
      where: { id: Number(id) },
      data: {
        itemId: Number(itemId),
        initialQuantity: parseFloat(initialQuantity.toString()),
        currentQuantity: parseFloat(currentQuantity.toString()),
        totalPrice: parseFloat(totalPrice.toString()),
        supplierName: supplierName ?? null,
        purchaseDate: parsedPurchaseDate,
      },
    });

    return NextResponse.json(updatedProcurement, { status: 200 });
  } catch (error) {
    console.error("Error mengubah pengadaan:", error);
    return new NextResponse("Error mengubah pengadaan", { status: 500 });
  }
}
