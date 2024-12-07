"use client";
import React, { useState } from "react";
import Input from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const SignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if the response is successful
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token); // Simpan token di localStorage
        router.push("/"); // Redirect ke home
      }

      // If sign-in is successful, get the token and user data (including userId)
      const data = await response.json();

      // Store the JWT token in localStorage or sessionStorage (optional)
      localStorage.setItem("authToken", data.token); // Or use sessionStorage if you want it to expire when the session ends

      // Redirect to the home page after successful sign-in
      router.push("/");
    } catch (error) {
      setError("An error occurred while signing in.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit">Sign In</Button>
    </form>
  );
};

export default SignInForm;
