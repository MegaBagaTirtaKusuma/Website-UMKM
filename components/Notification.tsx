// components/Notification.tsx
"use client";
import { useEffect, useState } from "react";
import { AlertOctagon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fetchWithAuth } from "../lib/utils";

interface NotificationItem {
  id: number;
  itemName: string;
  currentQuantity: number;
  unit: string | null; // Tambahkan ini
}

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth("/api/procurement/notif", {
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Error: ${response.status} ${response.statusText}, ${
              errorData.error || ""
            }`
          );
        }

        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError("Gagal memuat notifikasi. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Memuat notifikasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Tidak ada notifikasi</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {notifications.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center space-x-3">
            <AlertOctagon className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium">Stok Habis</p>
              <p className="text-sm text-gray-500">
                {item.itemName} tersisa {item.currentQuantity}{" "}
                {item.unit || "unit"}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Notification;
