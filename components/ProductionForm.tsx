// /components/productionform.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/utils";

interface ProcurementItem {
  id: number;
  item: {
    id: number;
    itemName: string;
    unit: string;
  };
  initialQuantity: number;
  currentQuantity: number;
  totalPrice: number;
  supplierName: string | null;
  purchaseDate: string;
}

interface FormValues {
  productName: string;
  productionDate: string;
  productionQuantity: number;
  items: { procurementId: number; quantity: number }[];
}

export default function ProductionForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groupedProcurementItems, setGroupedProcurementItems] = useState<{
    [key: string]: ProcurementItem;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWithAuth("/api/procurement", {
          method: "GET",
        });
        const result = await response.json();

        if (!Array.isArray(result)) {
          throw new Error("Invalid data format. Expected an array.");
        }

        // Kelompokkan item berdasarkan itemId
        const grouped = result.reduce((acc, item) => {
          const key = item.item.id;
          // Hanya simpan satu item untuk setiap itemId
          if (!acc[key]) {
            acc[key] = item;
          }
          return acc;
        }, {} as { [key: string]: ProcurementItem });

        setGroupedProcurementItems(grouped);
      } catch (error) {
        console.error("Error fetching procurement data:", error);
        setError("Gagal memuat data pengadaan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetchWithAuth("/api/production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: data.items.map((item) => ({
            procurementId: Number(item.procurementId),
            quantity: Number(item.quantity),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan data produksi.");
      }

      alert("Produksi berhasil disimpan!");
      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error saving production:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan produksi."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <Input
        label="Nama Produk"
        id="productName"
        placeholder="Nama Produk"
        {...register("productName", {
          required: "Nama produk diperlukan",
        })}
        error={
          errors.productName
            ? { message: errors.productName.message }
            : undefined
        }
      />

      <Input
        label="Tanggal Produksi"
        id="productionDate"
        type="date"
        {...register("productionDate", {
          required: "Tanggal produksi diperlukan",
        })}
        error={
          errors.productionDate
            ? { message: errors.productionDate.message }
            : undefined
        }
      />

      <Input
        label="Jumlah Produksi"
        id="productionQuantity"
        type="number"
        placeholder="Jumlah Produksi"
        {...register("productionQuantity", {
          required: "Jumlah produksi diperlukan",
          valueAsNumber: true,
          validate: (value) => value > 0 || "Jumlah harus lebih besar dari 0",
        })}
        error={
          errors.productionQuantity
            ? { message: errors.productionQuantity.message }
            : undefined
        }
      />

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center">
          <div className="flex-1">
            <select
              {...register(`items.${index}.procurementId`, {
                required: "Pilih bahan yang akan digunakan",
                valueAsNumber: true,
              })}
              className="w-full border p-2 rounded"
            >
              <option value="">Pilih Bahan</option>
              {Object.values(groupedProcurementItems).map((procItem) => (
                <option key={procItem.id} value={procItem.id}>
                  {procItem.item.itemName} (Stok:{" "}
                  {procItem.currentQuantity.toFixed(2)} {procItem.item.unit})
                </option>
              ))}
            </select>
            {errors.items?.[index]?.procurementId && (
              <p className="text-red-500 text-sm">
                {errors.items[index].procurementId?.message}
              </p>
            )}
          </div>

          <div className="flex-1">
            <Input
              label={`Jumlah bahan ${index + 1}`}
              id={`items.${index}.quantity`}
              type="number"
              step="0.01" // Tambahkan ini untuk memungkinkan input desimal
              placeholder="Jumlah"
              min={0}
              {...register(`items.${index}.quantity`, {
                required: "Jumlah yang digunakan diperlukan",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Jumlah harus lebih besar dari 0",
                },
                validate: (value) =>
                  value > 0 || "Jumlah harus lebih besar dari 0",
              })}
              error={
                errors.items?.[index]?.quantity
                  ? { message: errors.items[index].quantity?.message }
                  : undefined
              }
            />
          </div>

          <Button
            type="button"
            onClick={() => remove(index)}
            className="bg-red-500 hover:bg-red-600"
          >
            Hapus
          </Button>
        </div>
      ))}

      <Button
        type="button"
        onClick={() => append({ procurementId: 0, quantity: 0 })}
      >
        Tambah Bahan
      </Button>

      <Button type="submit" variant="default" className="mt-4">
        Simpan Produksi
      </Button>
    </form>
  );
}
