import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    console.log("Verifying token:", token);

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    console.log("User found:", user ? "Yes" : "No");
    console.log("Token expires:", user?.resetPasswordExpires);
    console.log("Current time:", new Date());

    if (!user) {
      return NextResponse.json(
        {
          valid: false,
          message: "Token reset sudah kedaluwarsa atau tidak valid",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat memverifikasi token",
      },
      { status: 500 }
    );
  }
}
