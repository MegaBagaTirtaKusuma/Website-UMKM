import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

// Mendeklarasikan secret key untuk JWT
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// GET: Mengambil data produksi dan detail items beserta procurement
export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token not provided", { status: 401 });
    }

    const token = tokenCookie.value;

    // Verifikasi dan dekode token
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

    // Mendapatkan data produksi hanya untuk user yang sedang login
    const productions = await prisma.production.findMany({
      where: { userId }, // Filter berdasarkan userId
      include: {
        items: {
          include: {
            procurement: true,
          },
        },
      },
    });

    const formattedProductions = productions.map((production) => ({
      id: production.id,
      productName: production.productName,
      productionDate: production.productionDate.toISOString(),
      productionQuantity: production.productionQuantity,
      items: production.items.map((item) => ({
        itemName: item.procurement.itemName,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json(formattedProductions);
  } catch (error) {
    console.error("Error fetching production data:", error);
    return new NextResponse("Error fetching production data", { status: 500 });
  }
}

// POST: Menambahkan data produksi baru
export async function POST(req: Request) {
  try {
    // Mengambil token dari cookie
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new NextResponse("Token not provided", { status: 401 });
    }

    const token = tokenCookie.value;

    // Verifikasi dan dekode token
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

    // Mendapatkan data dari request body
    const { items, productionDate, productName, productionQuantity } =
      await req.json();

    // Validasi input
    if (
      !items ||
      items.length === 0 ||
      !productionDate ||
      !productName ||
      productionQuantity == null
    ) {
      return new NextResponse(
        JSON.stringify({ error: "All fields are required, including userId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parsing dan validasi tanggal produksi
    const parsedProductionDate = new Date(productionDate);
    if (isNaN(parsedProductionDate.getTime())) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid productionDate" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Membuat produksi baru dengan menghubungkan userId
    const production = await prisma.production.create({
      data: {
        productName,
        productionDate: parsedProductionDate,
        productionQuantity,
        userId, // Menambahkan userId yang diterima dari token
        items: {
          create: items.map((item: { id: number; quantity: number }) => ({
            quantity: item.quantity,
            procurement: {
              connect: { id: item.id },
            },
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update quantity procurement setelah produksi
    await Promise.all(
      items.map((item: { id: number; quantity: number }) =>
        prisma.procurement.update({
          where: { id: item.id },
          data: {
            currentQuantity: {
              decrement: item.quantity, // Mengurangi jumlah yang ada di procurement
            },
          },
        })
      )
    );

    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    console.error("Error saving production:", error);
    return new NextResponse(
      JSON.stringify({ error: "Error saving production" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
