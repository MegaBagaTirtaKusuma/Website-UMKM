import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtVerify, SignJWT, JWTPayload } from "jose";

// lib/utils.ts

// Fungsi untuk menggabungkan kelas dengan Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// JWT Secret dari environment
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultsecret"
);

/**
 * Fungsi untuk membuat token JWT
 * @param payload - Data payload yang akan disertakan dalam token
 * @returns - Token JWT sebagai string
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" }) // Header JWT
      .setExpirationTime("7d") // Token berlaku selama 7 hari
      .sign(SECRET); // Gunakan secret key untuk tanda tangan
  } catch (error) {
    console.error("Error creating token:", error);
    throw new Error("Token creation failed");
  }
}

/**
 * Fungsi untuk mendapatkan userId dari token JWT
 * @param req - Request object
 * @returns - userId jika valid, null jika tidak
 */
export async function getUserIdFromToken(req: Request): Promise<number | null> {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      console.error("Authorization header not found");
      return null;
    }

    const token = authHeader.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) {
      console.error("Token not found in Authorization header");
      return null;
    }

    // Verifikasi token menggunakan jose
    const { payload } = await jwtVerify(token, SECRET);

    // Pastikan payload memiliki field `id`
    if (!payload || typeof payload.id !== "number") {
      console.error("Invalid token payload");
      return null;
    }

    return payload.id as number; // Return userId dari payload token
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Fungsi untuk melakukan fetch dengan menambahkan token JWT ke header
 * @param url - URL endpoint
 * @param options - Opsi fetch
 * @returns - Respons fetch
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = localStorage.getItem("authToken"); // Ambil token dari localStorage
    if (!token) {
      console.error("Token not found in localStorage");
      throw new Error("Token is missing");
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`, // Tambahkan header Authorization
    };

    return await fetch(url, { ...options, credentials: "include" });
  } catch (error) {
    console.error("Error in fetchWithAuth:", error);
    throw error;
  }
}
