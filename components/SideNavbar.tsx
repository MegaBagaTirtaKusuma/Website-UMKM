"use client";

import { Nav } from "./ui/nav";
import {
  HandPlatter,
  ShoppingBasket,
  CircleDollarSign,
  LayoutDashboard,
  UsersRound,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";

const SideNavbar: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const [mobileWidth, setMobileWidth] = useState(false);
  const [showProcurementMenu, setShowProcurementMenu] = useState(false);
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    const updateWidth = () => {
      setMobileWidth(window.innerWidth < 768);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const procurementSubMenus = [
    {
      title: "Manajemen Bahan",
      href: "/item",
      icon: ChevronRight,
      variant: "ghost" as const,
      onClick: () => setPageTitle("Pengadaan"),
    },
  ];

  const navLinks = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      variant: "default" as const,
      onClick: () => setPageTitle("Dashboard"),
    },
    {
      title: "Pengadaan",
      href: "/procurement",
      icon: ShoppingBasket,
      variant: "ghost" as const,
      onClick: () => {
        setShowProcurementMenu(!showProcurementMenu);
        setPageTitle("Pengadaan");
      },
    },
    ...(showProcurementMenu ? procurementSubMenus : []),
    {
      title: "Produksi",
      href: "/production",
      icon: HandPlatter,
      variant: "ghost" as const,
      onClick: () => setPageTitle("Produksi"),
    },
    {
      title: "Penjualan",
      href: "/sales",
      icon: CircleDollarSign,
      variant: "ghost" as const,
      onClick: () => setPageTitle("Penjualan"),
    },
    {
      title: "Keuangan",
      href: "/finance",
      icon: Wallet,
      variant: "ghost" as const,
      onClick: () => setPageTitle("Keuangan"),
    },
    {
      title: "Sign Out",
      href: "#",
      icon: UsersRound,
      variant: "ghost" as const,
      onClick: async () => {
        try {
          await fetch("/api/auth/sign-out", {
            method: "POST",
            credentials: "include",
          });
          setPageTitle("Signed Out");
          window.location.href = "/auth/sign-in";
        } catch (error) {
          console.error("Failed to sign out:", error);
        }
      },
    },
  ];

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
      {!isCollapsed && <Nav isCollapsed={mobileWidth} links={navLinks} />}
    </div>
  );
};

export default SideNavbar;
