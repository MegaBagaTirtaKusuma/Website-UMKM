import SignUpForm from "@/components/SignUpForm";
import Link from "next/link";

const SignUpPage = () => {
  return (
    <div className="container">
      <h1>Sign Up</h1>
      <SignUpForm />
      <p>
        Already have an account? <Link href="/auth/sign-in">Sign In</Link>
      </p>
    </div>
  );
};

export default SignUpPage;
