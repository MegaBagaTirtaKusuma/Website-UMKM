// app/auth/sign-in/page.tsx

import SignInForm from "@/components/SignInForm";
import Link from "next/link";

const SignInPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Masuk</h1>
      <SignInForm />
      <p className="mt-4 text-center">
        Belum punya akun?{" "}
        <Link href="/auth/sign-up" className="text-blue-500 underline">
          Daftar
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;
