import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset Password Anda",
    html: `
      <p>Anda telah meminta pengaturan Reset Password. Klik tautan di bawah ini untuk mengatur ulang Password Anda:</p>
      <a href="${resetUrl}">Atur Ulang Password</a>
      <p>Jika Anda tidak meminta ini, mohon abaikan email ini.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
