"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";

interface ProcurementItem {
  id: number;
  item_name: string;
  quantity: number;
}

interface FormValues {
  productName: string;
  productionDate: Date;
  productionQuantity: number;
  items: { id: number; item_name: string; quantity: number }[];
}

export default function ProductionForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [procurementItems] = useState<ProcurementItem[]>([
    // Contoh data untuk procurement items, Anda bisa sesuaikan dengan data nyata
    { id: 1, item_name: "Bahan A", quantity: 100 },
    { id: 2, item_name: "Bahan B", quantity: 50 },
    { id: 3, item_name: "Bahan C", quantity: 200 },
  ]);

  const onSubmit = async (_data: FormValues) => {
    // Tambahkan logic untuk mengirim data jika diperlukan
    console.log("Form submitted with data: ", _data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          <div>
            <select
              {...register(`items.${index}.item_name`, {
                required: "Pilih bahan yang akan digunakan",
              })}
              className="border p-2 rounded"
            >
              <option value="">Pilih Bahan</option>
              {procurementItems.map((item) => (
                <option key={item.id} value={item.item_name}>
                  {item.item_name} (Stok: {item.quantity})
                </option>
              ))}
            </select>
            {errors.items?.[index]?.item_name && (
              <p className="text-red-500 text-sm">
                {errors.items[index].item_name?.message}
              </p>
            )}
          </div>

          <Input
            label={`Jumlah bahan ${index + 1}`}
            id={`items.${index}.quantity`}
            type="number"
            placeholder="Jumlah"
            min={0}
            {...register(`items.${index}.quantity`, {
              required: "Jumlah yang digunakan diperlukan",
              valueAsNumber: true,
              validate: (value) =>
                value > 0 || "Jumlah harus lebih besar dari 0",
            })}
            error={
              errors.items?.[index]?.quantity
                ? { message: errors.items[index].quantity?.message }
                : undefined
            }
          />

          <Button
            type="button"
            onClick={() => remove(index)}
            className="bg-red-500"
          >
            Hapus
          </Button>
        </div>
      ))}

      <Button
        type="button"
        onClick={() => append({ id: 0, item_name: "", quantity: 0 })}
      >
        Tambah Bahan
      </Button>

      <Button type="submit" variant="default">
        Simpan Produksi
      </Button>
    </form>
  );
}
