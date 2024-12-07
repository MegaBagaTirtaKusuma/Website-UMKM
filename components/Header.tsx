"use client";

import { Bell, AlignJustify } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Notification from "@/components/Notification";
import { usePageTitle } from "@/context/PageTitleContext";

const Header = ({
  onToggleSidebar,
  isSidebarCollapsed,
}: {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}) => {
  const { pageTitle } = usePageTitle();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const updateWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch("/api/procurement/notif", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setNotificationCount(data.length); // Set jumlah notifikasi
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 5 * 60 * 1000); // Update setiap 5 menit
    return () => clearInterval(interval);
  }, []); // Fetch notifications saat komponen pertama kali dimuat

  return (
    <div
      className={`fixed right-0 h-16 border-b bg-white px-4 flex items-center justify-between z-50 transition-all duration-300 ${
        isSidebarCollapsed
          ? "left-0"
          : isMobile
          ? "left-[80px]"
          : "left-[80px] md:left-[200px]"
      }`}
    >
      <Button onClick={onToggleSidebar} variant="ghost" size="icon">
        <AlignJustify className="h-6 w-6" />
      </Button>
      <h1 className="font-semibold" style={{ fontSize: "24px" }}>
        {pageTitle}
      </h1>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notifikasi</SheetTitle>
          </SheetHeader>
          <Notification />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Header;
