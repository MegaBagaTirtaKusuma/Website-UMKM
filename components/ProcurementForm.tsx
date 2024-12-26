// components/ProcurementForm.tsx
"use client";

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
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState } from "react";

const PROCUREMENT_CATEGORIES = {
  BAHAN_BAKU: "Bahan Baku Produksi",
  BARANG_PENDUKUNG: "Barang Pendukung Produksi",
  PERAWATAN: "Perawatan dan Perbaikan",
  TRANSPORTASI: "Transportasi dan Pengiriman",
  UTILITAS: "Utilitas dan Tagihan",
  PROMOSI: "Promosi dan Pemasaran",
} as const;

const PROCUREMENT_UNITS = {
  UNIT: "Unit",
  KG: "Kg",
  LITER: "Liter",
} as const;

type ProcurementUnit =
  (typeof PROCUREMENT_UNITS)[keyof typeof PROCUREMENT_UNITS];

type ProcurementCategory =
  (typeof PROCUREMENT_CATEGORIES)[keyof typeof PROCUREMENT_CATEGORIES];

interface FormValues {
  category: ProcurementCategory;
  itemName?: string;
  initialQuantity?: number;
  unit?: ProcurementUnit;
  totalPrice: number;
  supplierName?: string;
  purchaseDate: Date;
}

export default function ProcurementForm() {
  const [category, setCategory] = useState<ProcurementCategory | "">("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  // Modifikasi onSubmit untuk mengirim unit
  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/procurement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          category,
          unit: data.unit, // Tambahkan unit ke data yang dikirim
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Pengadaan berhasil disimpan!");
        reset();
        setCategory("");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saat menyimpan pengadaan.");
    }
  };

  const renderFormFields = () => {
    switch (category) {
      case PROCUREMENT_CATEGORIES.BAHAN_BAKU:
        return (
          <>
            <FormField
              name="itemName"
              label="Nama Bahan"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <div className="flex gap-2">
              <div className="flex-1 min-w-[100px] w-full">
                <FormField
                  name="initialQuantity"
                  label="Kuantitas"
                  type="number"
                  register={register}
                  errors={errors}
                  required
                />
              </div>
              <div>
                <label htmlFor="unit" className="block mb-2">
                  Satuan
                </label>
                <select
                  id="unit"
                  {...register("unit", { required: "Pilih satuan" })}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Pilih Satuan</option>
                  {Object.values(PROCUREMENT_UNITS).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-500 text-sm">{errors.unit.message}</p>
                )}
              </div>
            </div>
            <FormField
              name="totalPrice"
              label="Harga Total"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="supplierName"
              label="Nama Supplier"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="purchaseDate"
              label="Tanggal Pembelian"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        );

      case PROCUREMENT_CATEGORIES.BARANG_PENDUKUNG:
        return (
          <>
            <FormField
              name="itemName"
              label="Nama Barang"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="initialQuantity"
              label="Kuantitas"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="totalPrice"
              label="Harga Total"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="supplierName"
              label="Nama Supplier"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="purchaseDate"
              label="Tanggal Pembelian"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        );

      case PROCUREMENT_CATEGORIES.PERAWATAN:
        return (
          <>
            <FormField
              name="itemName"
              label="Nama Barang"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="totalPrice"
              label="Biaya Perbaikan"
              type="number"
              register={register}
              errors={errors}
              required
            />

            <FormField
              name="purchaseDate"
              label="Tanggal Perbaikan"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        );

      case PROCUREMENT_CATEGORIES.TRANSPORTASI:
        return (
          <>
            <FormField
              name="itemName"
              label="Nama Transportasi/Pengiriman"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="totalPrice"
              label="Biaya Transportasi/Pengiriman"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="purchaseDate"
              label="Tanggal Transportasi/Pengiriman"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        );

      case PROCUREMENT_CATEGORIES.UTILITAS:
        return (
          <>
            <FormField
              name="itemName"
              label="Nama Tagihan"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="totalPrice"
              label="Biaya Tagihan"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="purchaseDate"
              label="Tanggal Tagihan"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        );

      case PROCUREMENT_CATEGORIES.PROMOSI:
        return (
          <>
            <FormField
              name="itemName"
              label="Nama Promosi"
              register={register}
              errors={errors}
              required
              maxLength={255}
            />
            <FormField
              name="totalPrice"
              label="Biaya Promosi"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="purchaseDate"
              label="Tanggal Promosi"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Select
          value={category}
          onValueChange={(value: ProcurementCategory) => setCategory(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori Pengadaan" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(PROCUREMENT_CATEGORIES).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {renderFormFields()}

        {category && (
          <Button type="submit" variant="default">
            Simpan Pengadaan
          </Button>
        )}
      </form>
    </TooltipProvider>
  );
}

interface FormFieldProps {
  name: keyof FormValues;
  label: string;
  type?: string;
  register: any;
  errors: any;
  required?: boolean;
  maxLength?: number; // Tambahkan ini jika belum ada
}

// Definisi FormField
const FormField = ({
  name,
  label,
  type = "text",
  register,
  errors,
  required,
  maxLength,
}: FormFieldProps) => {
  const [maxDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
  });

  const registerOptions: any = {
    required: required ? `Kolom ${label} diperlukan.` : false,
    maxLength: maxLength
      ? {
          value: maxLength,
          message: `${label} tidak boleh lebih dari ${maxLength} karakter.`,
        }
      : undefined,
  };

  if (type === "date") {
    registerOptions.max = {
      value: maxDate,
      message: `${label} tidak boleh lebih dari hari ini.`,
    };
  }

  if (type === "number") {
    registerOptions.min = {
      value: 0,
      message: `${label} harus lebih besar atau sama dengan 0.`,
    };
    registerOptions.validate = (value: number) =>
      value >= 0 || `${label} harus lebih besar atau sama dengan 0.`;
  }

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
            {...register(name, registerOptions)}
            max={type === "date" ? maxDate : undefined}
          />
        </TooltipTrigger>
        <TooltipContent>Masukkan {label.toLowerCase()}</TooltipContent>
      </Tooltip>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};
