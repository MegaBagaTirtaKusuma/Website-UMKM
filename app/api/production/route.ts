// api/production/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

interface ProductionWithItems {
  id: number;
  productName: string;
  productionDate: Date;
  productionQuantity: number;
  userId: number;
  items: {
    id: number;
    quantity: number;
    procurementId: number;
    productionId: number;
    procurement: {
      item: {
        id: number;
        itemName: string;
        unit: string | null;
      };
    };
  }[];
}

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
            procurement: {
              include: {
                item: true,
              },
            },
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
        itemName: item.procurement.item.itemName,
        quantity: item.quantity,
        unit: item.procurement.item.unit,
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
        JSON.stringify({ error: "All fields are required" }),
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

    // Memulai transaksi untuk memastikan konsistensi data
    const result: ProductionWithItems = await prisma.$transaction(
      async (tx) => {
        // Membuat produksi baru dengan menghubungkan userId
        const newProduction = await tx.production.create({
          data: {
            productName,
            productionDate: parsedProductionDate,
            productionQuantity,
            userId,
            items: {
              create: items.map(
                (item: { procurementId: number; quantity: number }) => ({
                  quantity: Number(item.quantity.toFixed(2)),
                  procurement: {
                    connect: { id: item.procurementId },
                  },
                })
              ),
            },
          },
          include: {
            items: {
              include: {
                procurement: {
                  include: {
                    item: true,
                  },
                },
              },
            },
          },
        });

        // Update quantity procurement setelah produksi
        for (const item of items) {
          // Dapatkan procurement yang dipilih untuk mendapatkan itemId
          const selectedProcurement = await tx.procurement.findUnique({
            where: { id: item.procurementId },
          });

          if (!selectedProcurement) {
            throw new Error(
              `Procurement with id ${item.procurementId} not found`
            );
          }

          // Update semua procurement dengan itemId yang sama
          const allProcurements = await tx.procurement.findMany({
            where: {
              itemId: selectedProcurement.itemId,
              userId,
            },
          });

          if (allProcurements.length === 0) {
            throw new Error(
              `No procurements found for item ${selectedProcurement.itemId}`
            );
          }

          const newQuantity = Number(
            (allProcurements[0].currentQuantity - item.quantity).toFixed(2)
          );

          if (newQuantity < 0) {
            throw new Error(
              `Not enough stock for item ${selectedProcurement.itemId}`
            );
          }

          // Update currentQuantity untuk semua procurement dengan itemId yang sama
          await tx.procurement.updateMany({
            where: {
              itemId: selectedProcurement.itemId,
              userId,
            },
            data: {
              currentQuantity: newQuantity,
            },
          });
        }

        return newProduction;
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving production:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Error saving production",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
