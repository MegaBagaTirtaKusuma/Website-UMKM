import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

// Mendapatkan secret key untuk validasi JWT
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function GET(req: NextRequest) {
  try {
    // Mengambil cookie header dari request
    const cookieHeader = req.headers.get("cookie");

    // Mengecek apakah cookie tersedia
    if (!cookieHeader) {
      return NextResponse.json(
        { message: "Unauthorized - Cookie not found" },
        { status: 401 }
      );
    }

    // Mencari token dari cookie dengan nama "authToken"
    const token = cookieHeader
      ?.split("; ")
      .find((c: string) => c.startsWith("authToken="))
      ?.split("=")[1];

    // Mengecek apakah token ditemukan
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - Token not found" },
        { status: 401 }
      );
    }

    // Verifikasi token menggunakan JWT secret
    const { payload } = await jwtVerify(token, SECRET);

    // Jika token valid, ambil userId dari payload
    const userId = payload.id as string;
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - User ID not found" },
        { status: 401 }
      );
    }

    // Mengembalikan respons bahwa token valid dan memberikan userId
    return NextResponse.json(
      { message: "Token valid", userId },
      { status: 200 }
    );
  } catch (error) {
    // Menangani error jika token tidak valid atau terjadi kesalahan lainnya
    if (error instanceof Error) {
      console.error("Error validasi token:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    return NextResponse.json(
      { message: "Invalid token", error: (error as Error).message },
      { status: 401 }
    );
  }
}
