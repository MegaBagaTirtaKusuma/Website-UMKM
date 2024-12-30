"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import useSWR from "swr";

// Define the data structure for ProductionItem
interface ProductionItem {
  id: number;
  productName: string;
  productionQuantity: number;
}

// Define the structure for the form values
interface FormValues {
  productionId: number;
  saleQuantity: number;
  salePrice: number;
  saleDate: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SalesForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  // Use SWR to fetch production data
  const { data: productions, error } = useSWR<ProductionItem[]>(
    "/api/production",
    fetcher
  );

  // Handle error in data fetching
  if (error) {
    console.error("Failed to fetch production data:", error);
    return <div>Error fetching production data.</div>;
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Penjualan berhasil disimpan!");
        reset(); // Reset the form after successful submission
      } else {
        const result = await response.json();
        alert(`Error: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saat menyimpan penjualan:", error);
      alert("Error saat menyimpan penjualan.");
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 shadow-md bg-white">
      <h1 className="text-lg font-semibold mb-4">Formulir Penjualan</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <select
          {...register("productionId", {
            required: "Pilih produk yang ingin dijual",
          })}
          className="border border-gray-300 p-2 rounded-md"
        >
          <option value="">Pilih produk</option>
          {productions ? (
            productions.map((production) => (
              <option key={production.id} value={production.id}>
                {production.productName} (Stok: {production.productionQuantity})
              </option>
            ))
          ) : (
            <option value="" disabled>
              Loading produk...
            </option>
          )}
        </select>
        {errors.productionId && (
          <p className="text-red-500">{errors.productionId.message}</p>
        )}

        <Input
          label="Jumlah Penjualan"
          type="number"
          {...register("saleQuantity", {
            required: "Jumlah penjualan harus diisi",
            min: { value: 1, message: "Jumlah penjualan harus lebih dari 0" },
          })}
          placeholder="Jumlah penjualan"
        />
        {errors.saleQuantity && (
          <p className="text-red-500">{errors.saleQuantity.message}</p>
        )}

        <Input
          label="Harga Penjualan"
          type="number"
          {...register("salePrice", {
            required: "Harga penjualan harus diisi",
            min: { value: 1, message: "Harga penjualan harus lebih dari 0" },
          })}
          placeholder="Harga penjualan"
        />
        {errors.salePrice && (
          <p className="text-red-500">{errors.salePrice.message}</p>
        )}

        <Input
          label="Tanggal Penjualan"
          type="date"
          {...register("saleDate", {
            required: "Tanggal penjualan harus diisi",
          })}
          placeholder="Tanggal penjualan"
        />
        {errors.saleDate && (
          <p className="text-red-500">{errors.saleDate.message}</p>
        )}
        <Button type="submit">Simpan</Button>
      </form>
    </div>
  );
}
