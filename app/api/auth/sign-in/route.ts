// app/api/auth/sign-in/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Secret untuk menandatangani token
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

export async function POST(req: Request) {
  try {
    // Mengambil data JSON dari request body
    const { email, password } = await req.json();

    // Memeriksa apakah email dan password diberikan
    if (!email || !password) {
      return NextResponse.json(
        { message: "Both email and password are required" },
        { status: 400 }
      );
    }

    // Mencari pengguna berdasarkan email di database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Membandingkan password yang diberikan dengan password yang disimpan (hashed)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // Membuat token JWT dengan ID pengguna dan email sebagai payload
    const token = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" }) // Menentukan algoritma yang digunakan untuk menandatangani
      .setExpirationTime("7d") // Token berlaku selama 7 hari
      .sign(SECRET); // Menandatangani token dengan secret key

    // Membuat response untuk memberitahukan bahwa sign-in berhasil
    const response = NextResponse.json(
      { message: "Sign-in successful" },
      { status: 200 }
    );

    // Menyimpan token di cookie HTTP-only
    response.cookies.set("authToken", token, {
      httpOnly: true, // Agar cookie hanya bisa diakses oleh server
      secure: process.env.NODE_ENV === "production", // Menggunakan secure cookie jika di production
      sameSite: "strict", // Mencegah akses cookie oleh situs lain
      path: "/", // Cookie dapat diakses di seluruh aplikasi
      maxAge: 7 * 24 * 60 * 60, // Cookie berlaku selama 7 hari
    });

    // Mengembalikan response
    return response;
  } catch (error) {
    console.error("Error signing in:", error);
    return NextResponse.json({ message: "Error signing in" }, { status: 500 });
  }
}

// Export this to indicate the route is dynamic
export const dynamic = "force-dynamic";
