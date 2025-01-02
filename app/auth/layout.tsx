// app/(root)/layout.tsx
/** @format */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "../../lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication",
  description: "User authentication pages",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen w-full flex items-center justify-center bg-gray-50",
          inter.className
        )}
      >
        {/* main page content */}
        <div className="p-8 bg-white shadow-lg rounded-md max-w-md w-full">
          {children}
        </div>
      </body>
    </html>
  );
}
