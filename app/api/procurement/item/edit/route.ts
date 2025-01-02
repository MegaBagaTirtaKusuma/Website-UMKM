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
      return new NextResponse("Data item tidak ditemukan", {
        status: 404,
      });
    }

    return NextResponse.json(itemData, { status: 200 });
  } catch (error) {
    console.error("Error fetching item data:", error);
    return new NextResponse("Error fetching item data", { status: 500 });
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

    // Verifikasi token
    try {
      await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new NextResponse("Token tidak valid", { status: 401 });
    }

    const data: {
      id: number;
      itemName: string;
      category: string;
      unit?: string;
    } = await req.json();

    console.log("Data received for update:", data);

    const { id, itemName, category, unit } = data;

    // Validasi input
    if (!id || !itemName || !category) {
      return new NextResponse("ID, itemName, and category are required", {
        status: 400,
      });
    }

    // Update item data in the database
    const updatedItem = await prisma.item.update({
      where: { id: Number(id) },
      data: {
        itemName,
        category,
        unit: unit || null,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating item data:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma error
      return new NextResponse(`Database error: ${error.message}`, {
        status: 500,
      });
    } else if (error instanceof Error) {
      // Other known errors
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    } else {
      // Unknown errors
      return new NextResponse("An unknown error occurred", { status: 500 });
    }
  }
}
