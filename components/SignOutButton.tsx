"use client";
// components/SignOutButton.tsx
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Request to sign out API
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      // Redirect to sign-in page after sign-out
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
