// ProcurementEdit.tsx
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Item {
  id: number;
  itemName: string;
  category: string;
  unit: string | null;
}

interface FormValues {
  itemId: number;
  initialQuantity: number;
  currentQuantity: number;
  totalPrice: number;
  supplierName?: string;
  purchaseDate: string;
}

export default function ProcurementEdit() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const procurementId = searchParams.get("id");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/procurement/item");
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        } else {
          console.error("Gagal mengambil bahan");
        }
      } catch (error) {
        console.error("Error mengambil bahan:", error);
      }
    };

    fetchItems();

    if (!procurementId) {
      router.push("/procurement");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/procurement/edit?id=${procurementId}`
        );
        const data = await response.json();
        if (response.ok) {
          setSelectedItem(data.item);
          reset({
            itemId: data.itemId,
            initialQuantity: data.initialQuantity,
            currentQuantity: data.currentQuantity,
            totalPrice: data.totalPrice,
            supplierName: data.supplierName,
            purchaseDate: new Date(data.purchaseDate)
              .toISOString()
              .split("T")[0],
          });
        } else {
          alert("Data tidak ditemukan!");
          router.push("/procurement");
        }
      } catch (error) {
        console.error("Error mengambil data pengadaan:", error);
        alert("Gagal mengambil data pengadaan");
        router.push("/procurement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [procurementId, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`/api/procurement/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: procurementId, ...data }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Pengadaan berhasil diubah!");
        router.push("/procurement");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error mengubah pengadaan:", error);
      alert("Error mengubah pengadaan.");
    }
  };

  const FormField = ({
    name,
    label,
    type = "text",
    required = false,
    maxLength,
  }: {
    name: keyof FormValues;
    label: string;
    type?: string;
    required?: boolean;
    maxLength?: number;
  }) => {
    const [maxDate] = useState(() => new Date().toISOString().split("T")[0]);

    return (
      <div className="flex flex-col">
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              label={label}
              id={name}
              type={type}
              step={type === "number" ? "0.01" : undefined}
              placeholder={label}
              {...register(name, {
                required: required ? `${label} wajib diisi.` : false,
                max:
                  type === "date"
                    ? {
                        value: maxDate,
                        message: `${label} tidak boleh lebih besar dari hari ini.`,
                      }
                    : undefined,
                min:
                  type === "number"
                    ? { value: 0, message: `${label} harus 0 atau lebih.` }
                    : undefined,
                maxLength: maxLength
                  ? {
                      value: maxLength,
                      message: `${label} tidak boleh lebih besar dari ${maxLength} karakter.`,
                    }
                  : undefined,
              })}
              max={type === "date" ? maxDate : undefined}
            />
          </TooltipTrigger>
          <TooltipContent>Masukkan {label.toLowerCase()}</TooltipContent>
        </Tooltip>
        {errors[name] && (
          <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Select
          value={selectedItem?.id.toString()}
          onValueChange={(value) => {
            const item = items.find((i) => i.id.toString() === value);
            setSelectedItem(item || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Bahan" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.itemName} ({item.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedItem && (
          <>
            <FormField
              name="initialQuantity"
              label={`Jumlah Awal (${selectedItem.unit || "Unit"})`}
              type="number"
              required
            />
            <FormField
              name="currentQuantity"
              label={`Jumlah Saat Ini (${selectedItem.unit || "Unit"})`}
              type="number"
              required
            />
            <FormField
              name="totalPrice"
              label="Total Harga"
              type="number"
              required
            />
            <FormField
              name="supplierName"
              label="Nama Supplier"
              maxLength={255}
            />
            <FormField
              name="purchaseDate"
              label="Tanggal Pengadaan"
              type="date"
              required
            />
          </>
        )}

        <Button type="submit" variant="default" disabled={!selectedItem}>
          Simpan Perubahan
        </Button>
      </form>
    </TooltipProvider>
  );
}
