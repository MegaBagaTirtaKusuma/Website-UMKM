import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Menggunakan jose untuk verifikasi JWT
import { cookies } from "next/headers"; // Menggunakan cookies dari Next.js untuk mengambil cookie

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function POST() {
  try {
    // Mengambil token dari cookie menggunakan 'next/headers' (Next.js 13)
    const tokenCookie = cookies().get("authToken");
    if (!tokenCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = tokenCookie.value;

    // Verifikasi token JWT menggunakan jose
    const { payload } = await jwtVerify(token, SECRET);

    // Token valid, mengembalikan userId yang ditemukan di payload
    if (payload && payload.id) {
      return NextResponse.json({ message: "Token valid", userId: payload.id });
    } else {
      return NextResponse.json(
        { message: "Invalid token payload" },
        { status: 401 }
      );
    }
  } catch (error) {
    // Menentukan tipe error secara eksplisit
    if (error instanceof Error) {
      console.error("JWT Verification Error:", error.message); // Log error untuk debugging
    } else {
      console.error("Unknown error occurred:", error); // Jika error bukan instance dari Error
    }
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
