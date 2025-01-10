import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as XLSX from "xlsx";

// Register fonts
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(angka);
};

export async function GET(req: Request) {
  try {
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

    const userId = decoded.payload.id;
    if (!userId) {
      return new NextResponse("ID Pengguna tidak ditemukan dalam token", {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = searchParams.get("format") || "pdf";

    if (!startDate || !endDate) {
      return new NextResponse("Tanggal mulai dan akhir diperlukan", {
        status: 400,
      });
    }

    const sales = await prisma.sales.findMany({
      where: {
        userId: Number(userId),
        saleDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        production: true,
      },
      orderBy: {
        saleDate: "desc",
      },
    });

    if (format === "pdf") {
      const tableBody = [
        [
          { text: "Nama Produk", style: "tableHeader" },
          { text: "Jumlah Terjual", style: "tableHeader" },
          { text: "Harga Jual", style: "tableHeader" },
          { text: "Tanggal", style: "tableHeader" },
        ],
      ];

      sales.forEach((item) => {
        tableBody.push([
          { text: item.production.productName || "-", style: "tableData" },
          { text: item.saleQuantity.toString(), style: "tableData" },
          { text: formatRupiah(item.salePrice), style: "tableData" },
          {
            text: new Date(item.saleDate).toLocaleDateString("id-ID"),
            style: "tableData",
          },
        ]);
      });

      const docDefinition: any = {
        content: [
          { text: "Laporan Penjualan", style: "header" },
          {
            text: `Periode: ${new Date(startDate).toLocaleDateString(
              "id-ID"
            )} - ${new Date(endDate).toLocaleDateString("id-ID")}`,
            style: "subheader",
          },
          {
            table: {
              headerRows: 1,
              // Menggunakan persentase dari total lebar
              widths: ["35%", "20%", "25%", "20%"],
              body: tableBody,
            },
          },
        ],
        styles: {
          header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
          subheader: { fontSize: 12, margin: [0, 0, 0, 10] },
          tableHeader: { bold: true, fontSize: 10, fillColor: "#f8f9fa" },
          tableData: { fontSize: 9 },
        },
        pageMargins: [30, 15, 10, 15],
      };

      const pdfDoc = pdfMake.createPdf(docDefinition);
      const buffer = await new Promise<Buffer>((resolve) => {
        pdfDoc.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        });
      });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="penjualan.pdf"',
        },
      });
    }

    if (format === "excel") {
      const tableData = sales.map((item) => ({
        "Nama Produk": item.production.productName || "-",
        "Jumlah Terjual": Number(item.saleQuantity),
        "Harga Jual": formatRupiah(item.salePrice),
        Tanggal: new Date(item.saleDate).toLocaleDateString("id-ID"),
      }));

      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="penjualan.xlsx"',
        },
      });
    }

    return new NextResponse("Format tidak dikenali", { status: 400 });
  } catch (error) {
    console.error("Error saat ekspor penjualan:", error);
    return new NextResponse("Terjadi kesalahan saat memproses ekspor", {
      status: 500,
    });
  }
}

export const dynamic = "force-dynamic";
