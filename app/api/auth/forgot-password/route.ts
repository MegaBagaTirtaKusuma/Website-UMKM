import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateResetToken } from "@/lib/utils";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now(ubah jd 20detik dlu)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    await sendResetPasswordEmail(user.email, resetToken);

    return NextResponse.json({
      message: "Password reset terkirim, silakan cek email anda!",
    });
  } catch (error) {
    console.error("Error in Lupa password:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
