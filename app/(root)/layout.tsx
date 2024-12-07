// app/(root)/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "../globals.css";
import { cn } from "../../lib/utils";
import SideNavbar from "@/components/SideNavbar";
import Header from "@/components/Header";
import { PageTitleProvider } from "@/context/PageTitleContext";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen w-full bg-white text-black",
          inter.className
        )}
      >
        <PageTitleProvider>
          <div className="flex min-h-screen">
            <SideNavbar isCollapsed={isSidebarCollapsed} />
            <div
              className={cn(
                "flex-1 transition-all duration-300",
                isSidebarCollapsed
                  ? "ml-0"
                  : isMobile
                  ? "ml-[80px]"
                  : "ml-[80px] md:ml-[200px]"
              )}
            >
              <Header
                onToggleSidebar={toggleSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
              />
              <main className="p-8 pt-24">{children}</main>
            </div>
          </div>
        </PageTitleProvider>
      </body>
    </html>
  );
}
