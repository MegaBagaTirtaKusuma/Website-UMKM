import prisma from "../../../lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

interface ProductionItemInput {
  procurementId: number;
  quantity: number;
}

// GET: Mengambil data produksi dan detail items beserta procurement
export async function GET() {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new Response(JSON.stringify({ error: "Token tidak ditemukan" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = tokenCookie.value;
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new Response(JSON.stringify({ error: "Token tidak valid" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = decoded.payload.id;
    if (!userId || typeof userId !== "number") {
      return new Response(
        JSON.stringify({ error: "Token tidak valid: userId tidak ditemukan" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
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
        quantity: Number(item.quantity.toFixed(2)),
        unit: item.procurement.item.unit,
      })),
    }));

    return new Response(JSON.stringify(ProductionWithItems), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching production data:", error);
    return new Response(
      JSON.stringify({ error: "Error mengambil data produksi" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST: Menambahkan data produksi baru
export async function POST(req: Request) {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new Response(JSON.stringify({ error: "Token tidak ditemukan" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = tokenCookie.value;
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new Response(JSON.stringify({ error: "Token tidak valid" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = decoded.payload.id;
    if (!userId || typeof userId !== "number") {
      return new Response(
        JSON.stringify({ error: "Token tidak valid: userId tidak ditemukan" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
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
      return new Response(
        JSON.stringify({ error: "Semua field harus diisi" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Verifikasi semua procurement dan stok terlebih dahulu
    const procurements = await prisma.procurement.findMany({
      where: {
        id: {
          in: items.map((item: ProductionItemInput) => item.procurementId),
        },
        userId,
      },
      include: { item: true },
    });

    // Validasi stok
    for (const item of items as ProductionItemInput[]) {
      const procurement = procurements.find((p) => p.id === item.procurementId);
      if (!procurement) {
        return new Response(
          JSON.stringify({
            error: `Procurement ${item.procurementId} tidak ditemukan`,
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const newQuantity = Number(
        (procurement.currentQuantity - item.quantity).toFixed(2)
      );
      if (newQuantity < 0) {
        return new Response(
          JSON.stringify({
            error: `Stok tidak cukup untuk bahan ${procurement.item.itemName}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    // 2. Buat produksi
    const newProduction = await prisma.production.create({
      data: {
        productName,
        productionDate: new Date(productionDate),
        productionQuantity: Number(productionQuantity),
        userId,
      },
    });

    try {
      // 3. Proses items dalam batch kecil
      const BATCH_SIZE = 2;
      const typedItems = items as ProductionItemInput[];

      for (let i = 0; i < typedItems.length; i += BATCH_SIZE) {
        const batch = typedItems.slice(i, i + BATCH_SIZE);

        await prisma.$transaction(
          async (tx) => {
            for (const item of batch) {
              // Buat production item
              await tx.productionItem.create({
                data: {
                  productionId: newProduction.id,
                  procurementId: item.procurementId,
                  quantity: Number(item.quantity.toFixed(2)),
                },
              });

              // Update stok
              const procurement = procurements.find(
                (p) => p.id === item.procurementId
              )!;
              const newQuantity = Number(
                (procurement.currentQuantity - item.quantity).toFixed(2)
              );

              await tx.procurement.update({
                where: { id: item.procurementId },
                data: { currentQuantity: newQuantity },
              });
            }
          },
          {
            maxWait: 3000,
            timeout: 5000,
          }
        );
      }

      // 4. Ambil data lengkap
      const completeProduction = await prisma.production.findUnique({
        where: { id: newProduction.id },
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

      return new Response(JSON.stringify(completeProduction), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Rollback jika terjadi error
      await prisma.production
        .delete({
          where: { id: newProduction.id },
        })
        .catch(console.error); // Ignore delete error

      throw error;
    }
  } catch (error) {
    console.error("Error saving production:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Error menyimpan produksi",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE: Menghapus data produksi
export async function DELETE(req: Request) {
  try {
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return new Response(JSON.stringify({ error: "Token tidak ditemukan" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = tokenCookie.value;
    let decoded;
    try {
      decoded = await jwtVerify(token, SECRET);
    } catch (err) {
      console.error("Token tidak valid:", err);
      return new Response(JSON.stringify({ error: "Token tidak valid" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = decoded.payload.id;
    if (!userId || typeof userId !== "number") {
      return new Response(
        JSON.stringify({ error: "Token tidak valid: userId tidak ditemukan" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "ID produksi diperlukan" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.$transaction(
      async (tx) => {
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
      },
      {
        maxWait: 5000,
        timeout: 8000,
      }
    );

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting production:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Error menghapus produksi",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
