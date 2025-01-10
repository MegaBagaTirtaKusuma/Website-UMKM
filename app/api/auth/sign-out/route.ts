import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Secret key untuk verifikasi JWT
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// Fungsi untuk memvalidasi token JWT
async function validateAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload; // Return payload jika valid
  } catch (error) {
    console.error("Invalid token during sign-out:", error);
    return null; // Return null jika token tidak valid
  }
}

// Handler untuk endpoint sign-out
export async function POST(req: Request) {
  // Ambil token dari cookie
  const token = req.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("authToken="))
    ?.split("=")[1];

  // Jika token ada, validasi token
  if (token) {
    const payload = await validateAuthToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 }); // Return error jika token tidak valid
    }
  }

  // Hapus cookie authToken
  const response = NextResponse.json(
    { message: "Sign-out successful" },
    { status: 200 }
  );
  response.cookies.set("authToken", "", {
    httpOnly: true, // Hanya dapat diakses oleh server
    secure: process.env.NODE_ENV === "production", // Cookie aman hanya di production
    path: "/", // Berlaku untuk seluruh domain
    maxAge: 0, // Segera kadaluarsa
  });

  return response;
}
