// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Mendapatkan secret key dari env dalam format Uint8Array
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

// Middleware untuk memvalidasi token JWT
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value; // Ambil token dari cookie

  // Jika token tidak ada, alihkan ke halaman sign-in
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  try {
    // Verifikasi token menggunakan jose
    const { payload } = await jwtVerify(token, SECRET);

    // Pastikan payload memiliki `id` dan valid
    if (!payload.id || typeof payload.id !== "number") {
      throw new Error("Invalid token payload");
    }

    // Set userId ke header untuk digunakan di handler berikutnya
    req.headers.set("X-User-Id", String(payload.id));
  } catch (error) {
    console.error("Invalid token:", error);

    // Alihkan pengguna ke halaman login jika token tidak valid
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("error", "Invalid token or session expired"); // Menambahkan query parameter untuk feedback lebih jelas
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico).*)"], // Skip API, auth, dan asset statis
};
