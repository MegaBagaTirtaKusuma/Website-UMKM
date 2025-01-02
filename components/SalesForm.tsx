"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import useSWR, { mutate } from "swr";
import { useState } from "react";

interface ProductionItem {
  id: number;
  productName: string;
  productionQuantity: number;
}

interface FormValues {
  productionId: number;
  saleQuantity: number;
  salePrice: number;
  saleDate: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data");
  return res.json();
};

export default function SalesForm() {
  const [serverError, setServerError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>();

  const { data: productions } = useSWR<ProductionItem[]>(
    "/api/production",
    fetcher
  );

  const selectedProductionId = watch("productionId");
  const selectedQuantity = watch("saleQuantity");

  const selectedProduction = productions?.find(
    (p) => p.id === Number(selectedProductionId)
  );

  const isStockAvailable =
    selectedProduction &&
    selectedQuantity &&
    selectedQuantity <= selectedProduction.productionQuantity;

  const onSubmit = async (data: FormValues) => {
    try {
      setServerError("");
      setSuccessMessage("");

      if (!isStockAvailable) {
        setServerError("Jumlah penjualan melebihi stok yang tersedia!");
        return;
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Mutate data produksi dan penjualan
        await mutate("/api/production");
        await mutate("/api/sales");

        setSuccessMessage("Data penjualan berhasil disimpan!");
        reset();
      } else {
        const result = await response.json();
        setServerError(result.error || "Terjadi kesalahan saat menyimpan data");
      }
    } catch (err) {
      console.error("Error saat menyimpan penjualan:", err);
      setServerError("Terjadi kesalahan pada sistem. Silakan coba lagi nanti.");
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 shadow-md bg-white">
      <h1 className="text-lg font-semibold mb-4">Formulir Penjualan</h1>

      {serverError && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-md">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pilih Produk</label>
          <select
            {...register("productionId", {
              required: "Silakan pilih produk yang akan dijual",
            })}
            className="w-full border border-gray-300 p-2 rounded-md"
          >
            <option value="">Pilih produk</option>
            {productions?.map((production) => (
              <option key={production.id} value={production.id}>
                {production.productName} (Stok: {production.productionQuantity})
              </option>
            )) || (
              <option value="" disabled>
                Memuat data produk...
              </option>
            )}
          </select>
          {errors.productionId && (
            <p className="text-red-500 text-sm">
              {errors.productionId.message}
            </p>
          )}
        </div>

        <Input
          label="Jumlah Penjualan"
          type="number"
          {...register("saleQuantity", {
            required: "Jumlah penjualan wajib diisi",
            min: { value: 1, message: "Jumlah penjualan minimal 1" },
            validate: (value) =>
              !selectedProduction ||
              value <= selectedProduction.productionQuantity ||
              "Jumlah penjualan melebihi stok yang tersedia",
          })}
          placeholder="Masukkan jumlah penjualan"
        />
        {errors.saleQuantity && (
          <p className="text-red-500 text-sm">{errors.saleQuantity.message}</p>
        )}

        <Input
          label="Harga Penjualan"
          type="number"
          {...register("salePrice", {
            required: "Harga penjualan wajib diisi",
            min: { value: 1000, message: "Harga minimal Rp 1.000" },
            validate: (value) => {
              if (value % 100 !== 0) {
                return "Harga harus dalam kelipatan 100";
              }
              return true;
            },
          })}
          placeholder="Masukkan harga penjualan"
        />
        {errors.salePrice && (
          <p className="text-red-500 text-sm">{errors.salePrice.message}</p>
        )}

        <Input
          label="Tanggal Penjualan"
          type="date"
          {...register("saleDate", {
            required: "Tanggal penjualan wajib diisi",
            validate: (value) => {
              const selectedDate = new Date(value);
              const today = new Date();
              return (
                selectedDate <= today ||
                "Tanggal tidak boleh lebih dari hari ini"
              );
            },
          })}
        />
        {errors.saleDate && (
          <p className="text-red-500 text-sm">{errors.saleDate.message}</p>
        )}

        <Button
          type="submit"
          disabled={!isStockAvailable && selectedQuantity > 0}
        >
          Simpan Penjualan
        </Button>
      </form>
    </div>
  );
}
