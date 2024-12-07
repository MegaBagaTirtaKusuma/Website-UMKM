import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// JWT Secret key
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// GET - Fetch procurement data for authenticated user
export async function GET() {
  try {
    // Retrieve token from cookie
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token not provided", { status: 401 });
    }

    const token = tokenCookie.value;

    // Verify token ok
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return new NextResponse("Invalid token", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId) {
      return new NextResponse("User ID not found in token", { status: 401 });
    }

    // Fetch procurement data from DB for the specific user
    const procurementData = await prisma.procurement.findMany({
      where: { userId },
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
      category?: string;
      itemName?: string;
      quantity?: string | number;
      unit?: string;
      totalPrice?: string | number;
      supplierName?: string;
      purchaseDate?: string;
    } = await req.json();

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token not provided", { status: 401 });
    }

    const token = tokenCookie.value;

    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return new NextResponse("Invalid token", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId || typeof userId !== "number") {
      return new NextResponse("Invalid token: userId not found", {
        status: 401,
      });
    }

    const {
      category,
      itemName,
      quantity,
      totalPrice,
      supplierName,
      purchaseDate,
    } = data;

    if (!category || !purchaseDate || totalPrice == null) {
      return new NextResponse(
        "Category, purchaseDate, and unitPrice are required",
        { status: 400 }
      );
    }

    const parsedQuantity = quantity ? Number(quantity) : null;
    const parsedUnitPrice = Number(totalPrice);

    if (
      isNaN(parsedUnitPrice) ||
      (parsedQuantity !== null && isNaN(parsedQuantity))
    ) {
      console.warn("Invalid quantity or unitPrice format");
      return new NextResponse("Quantity and unit price must be valid numbers", {
        status: 400,
      });
    }

    const parsedPurchaseDate = new Date(purchaseDate);
    if (isNaN(parsedPurchaseDate.getTime())) {
      console.warn("Invalid purchaseDate format");
      return new NextResponse("Invalid purchaseDate", { status: 400 });
    }

    const procurement = await prisma.procurement.create({
      data: {
        category,
        itemName: itemName ?? "",
        initialQuantity: parsedQuantity ?? undefined,
        currentQuantity: parsedQuantity ?? undefined,
        unit: data.unit ?? null,
        unitPrice: 0,
        totalPrice: parsedUnitPrice,
        supplierName: supplierName ?? null,
        purchaseDate: parsedPurchaseDate,
        userId,
      },
    });

    return NextResponse.json(procurement, { status: 201 });
  } catch (error) {
    console.error("Error saving procurement:", error);
    return new NextResponse("Error saving procurement", { status: 500 });
  }
}

// DELETE - Delete procurement data by ID
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID not provided", { status: 400 });
    }

    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token not provided", { status: 401 });
    }

    const token = tokenCookie.value;

    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return new NextResponse("Invalid token", { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId) {
      return new NextResponse("User ID not found in token", { status: 401 });
    }

    // Delete related production items first (to avoid foreign key constraint violation)
    await prisma.productionItem.deleteMany({
      where: {
        procurementId: Number(id),
      },
    });

    // Delete procurement record
    const procurement = await prisma.procurement.deleteMany({
      where: {
        id: Number(id),
        userId: userId, // Ensure only the authorized user can delete
      },
    });

    if (procurement.count === 0) {
      return new NextResponse("Data not found or you don't have permission", {
        status: 404,
      });
    }

    return NextResponse.json(
      { message: "Data successfully deleted" },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting procurement:", error);
    return new NextResponse("Error deleting procurement", { status: 500 });
  }
}
