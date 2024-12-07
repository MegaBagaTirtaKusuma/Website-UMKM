// app/api/procurement/edit/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Secret key untuk verifikasi JWT
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// Tandai route sebagai dynamic
export const dynamic = "force-dynamic";

// Fungsi untuk mengambil data pengadaan berdasarkan ID
export async function GET(req: Request) {
  try {
    // Mendapatkan ID dari URL
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID pengadaan tidak diberikan", { status: 400 });
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

    // Ambil data pengadaan berdasarkan ID
    const procurementData = await prisma.procurement.findUnique({
      where: {
        id: Number(id), // Pastikan ID adalah angka
      },
    });

    if (!procurementData) {
      return new NextResponse("Data pengadaan tidak ditemukan", {
        status: 404,
      });
    }

    // Pastikan menggunakan initialQuantity
    const result = {
      ...procurementData,
      quantity: procurementData.initialQuantity, // Menambahkan field quantity dari initialQuantity
      purchaseDate: procurementData.purchaseDate.toISOString().split("T")[0], // Pastikan format tanggal sesuai dengan input date
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching procurement data:", error);
    return new NextResponse("Error fetching procurement data", { status: 500 });
  }
}

// Fungsi untuk memperbarui data pengadaan
export async function PUT(req: Request) {
  try {
    const data: {
      id: number;
      category?: string;
      itemName?: string;
      quantity?: string | number;
      unit?: string;
      totalPrice?: string | number;
      supplierName?: string;
      purchaseDate?: string;
    } = await req.json();

    console.log("Data received for update:", data);

    const {
      id,
      category,
      itemName,
      quantity,
      unit,
      totalPrice,
      supplierName,
      purchaseDate,
    } = data;

    // Validasi input
    if (!id || !category || !purchaseDate || totalPrice == null) {
      return new NextResponse(
        "ID, category, purchaseDate, and totalPrice are required",
        { status: 400 }
      );
    }

    const parsedQuantity = quantity ? Number(quantity) : null;
    const parsedTotalPrice = Number(totalPrice);

    if (
      isNaN(parsedTotalPrice) ||
      (parsedQuantity !== null && isNaN(parsedQuantity))
    ) {
      console.warn("Invalid quantity or totalPrice format");
      return new NextResponse("Quantity and totalPrice must be valid numbers", {
        status: 400,
      });
    }

    const parsedPurchaseDate = new Date(purchaseDate);
    if (isNaN(parsedPurchaseDate.getTime())) {
      console.warn("Invalid purchaseDate format");
      return new NextResponse("Invalid purchaseDate format", { status: 400 });
    }

    // Update procurement data in the database
    const updatedProcurement = await prisma.procurement.update({
      where: { id },
      data: {
        category,
        itemName,
        initialQuantity: parsedQuantity ?? undefined,
        currentQuantity: parsedQuantity ?? undefined,
        unit: unit ?? null,
        totalPrice: parsedTotalPrice,
        supplierName: supplierName ?? null,
        purchaseDate: parsedPurchaseDate,
      },
    });

    return NextResponse.json(updatedProcurement, { status: 200 });
  } catch (error) {
    console.error("Error updating procurement data:", error);
    return new NextResponse("Error updating procurement data", { status: 500 });
  }
}
