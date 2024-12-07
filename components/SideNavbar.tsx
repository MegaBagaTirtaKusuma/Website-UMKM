// components/SideNavbar.tsx
"use client";

import { Nav } from "./ui/nav";
import {
  HandPlatter,
  ShoppingBasket,
  CircleDollarSign,
  LayoutDashboard,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";

const SideNavbar: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const [mobileWidth, setMobileWidth] = useState(false);
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    const updateWidth = () => {
      setMobileWidth(window.innerWidth < 768);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div
      className={`fixed left-0 top-0 h-full border-r pb-10 pt-24 bg-white z-40 transition-all duration-300 ${
        isCollapsed
          ? "w-0 overflow-hidden"
          : mobileWidth
          ? "w-[80px]"
          : "w-[80px] md:w-[200px]"
      }`}
    >
      {!isCollapsed && (
        <Nav
          isCollapsed={mobileWidth}
          links={[
            {
              title: "Dashboard",
              href: "/",
              icon: LayoutDashboard,
              variant: "default",
              onClick: () => setPageTitle("Dashboard"),
            },
            {
              title: "Pengadaan",
              href: "/procurement",
              icon: ShoppingBasket,
              variant: "ghost",
              onClick: () => setPageTitle("Pengadaan"),
            },
            {
              title: "Produksi",
              href: "/production",
              icon: HandPlatter,
              variant: "ghost",
              onClick: () => setPageTitle("Produksi"),
            },
            {
              title: "Penjualan",
              href: "/sales",
              icon: CircleDollarSign,
              variant: "ghost",
              onClick: () => setPageTitle("Penjualan"),
            },
            {
              title: "Keuangan",
              href: "/finance",
              icon: Wallet,
              variant: "ghost",
              onClick: () => setPageTitle("Keuangan"),
            },
            {
              title: "Sign Out",
              href: "#", // Tidak diperlukan pengalihan manual karena handleSignOut akan menangani prosesnya
              icon: UsersRound,
              variant: "ghost",
              onClick: async () => {
                try {
                  await fetch("/api/auth/sign-out", {
                    method: "POST",
                    credentials: "include",
                  });
                  setPageTitle("Signed Out"); // Opsional, mengatur judul halaman
                  window.location.href = "/auth/sign-in"; // Redirect ke halaman sign-in setelah sign-out
                } catch (error) {
                  console.error("Failed to sign out:", error);
                }
              },
            },
          ]}
        />
      )}
    </div>
  );
};

export default SideNavbar;
