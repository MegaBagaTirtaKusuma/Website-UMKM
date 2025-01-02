import SignUpForm from "@/components/SignUpForm";
import Link from "next/link";

const SignUpPage = () => {
  return (
    <div className="container">
      <h1>Sign Up</h1>
      <SignUpForm />
      <p className="mt-4 text-center">
        Sudah punya akun?{" "}
        <Link href="/auth/sign-in" className="text-blue-500 underline">
          Masuk
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
