import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

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

    const productions = await prisma.production.findMany({
      where: { userId },
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

    const ProductionWithItems = productions.map((production) => ({
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

    return NextResponse.json(ProductionWithItems);
  } catch (error) {
    console.error("Error fetching production data:", error);
    return new NextResponse("Error fetching production data", { status: 500 });
  }
}

// POST: Menambahkan data produksi baru
export async function POST(req: Request) {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return NextResponse.json(
        { error: "Token not provided" },
        { status: 401 }
      );
    }

    const token = tokenCookie.value;
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Invalid token:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.payload.id;
    if (!userId || typeof userId !== "number") {
      return NextResponse.json(
        { error: "Invalid token: userId not found" },
        { status: 401 }
      );
    }

    const { items, productionDate, productName, productionQuantity } =
      await req.json();

    if (
      !items?.length ||
      !productionDate ||
      !productName ||
      productionQuantity == null
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const parsedProductionDate = new Date(productionDate);
    if (isNaN(parsedProductionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid productionDate" },
        { status: 400 }
      );
    }

    // Ambil semua procurement yang dibutuhkan dalam satu query
    const procurements = await prisma.procurement.findMany({
      where: {
        id: {
          in: items.map(
            (item: { procurementId: number }) => item.procurementId
          ),
        },
        userId,
      },
    });

    // Validasi stok sebelum memulai transaksi
    for (const item of items) {
      const procurement = procurements.find((p) => p.id === item.procurementId);
      if (!procurement) {
        return NextResponse.json(
          { error: `Procurement with id ${item.procurementId} not found` },
          { status: 404 }
        );
      }

      const newQuantity = Number(
        (procurement.currentQuantity - item.quantity).toFixed(2)
      );
      if (newQuantity < 0) {
        return NextResponse.json(
          { error: `Insufficient stock for procurement ${item.procurementId}` },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Buat produksi baru
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

        // Update semua procurement dalam satu batch
        await Promise.all(
          items.map((item: { procurementId: number; quantity: number }) => {
            const procurement = procurements.find(
              (p) => p.id === item.procurementId
            )!;
            const newQuantity = Number(
              (procurement.currentQuantity - item.quantity).toFixed(2)
            );

            return tx.procurement.update({
              where: { id: item.procurementId },
              data: { currentQuantity: newQuantity },
            });
          })
        );

        return newProduction;
      },
      {
        timeout: 8000, // Kurangi timeout untuk mencegah gateway timeout
        maxWait: 5000,
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

// DELETE: Menghapus data produksi
export async function DELETE(req: Request) {
  try {
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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new NextResponse("Production ID is required", { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Hapus data sales terlebih dahulu
      await tx.sales.deleteMany({
        where: {
          productionId: parseInt(id),
        },
      });

      // Hapus items produksi
      await tx.productionItem.deleteMany({
        where: {
          productionId: parseInt(id),
        },
      });

      // Terakhir hapus produksi
      await tx.production.delete({
        where: {
          id: parseInt(id),
          userId: userId,
        },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting production:", error);
    return new NextResponse(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Error deleting production",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
