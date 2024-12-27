"use client";

import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p>Invalid or missing reset token.</p>
      )}
    </div>
  );
}
