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

const ITEM_CATEGORIES = {
  BAHAN_BAKU: "Bahan Baku Produksi",
  BARANG_PENDUKUNG: "Bahan/Barang Pendukung Produksi",
} as const;

const ITEM_UNITS = {
  UNIT: "Unit",
  KG: "Kg",
  LITER: "Liter",
} as const;

type ItemUnit = keyof typeof ITEM_UNITS;
type ItemCategory = keyof typeof ITEM_CATEGORIES;

interface FormValues {
  itemName: string;
  category: ItemCategory;
  unit: ItemUnit;
}

interface FormFieldProps {
  name: keyof FormValues;
  label: string;
  register: any;
  errors: any;
  required?: boolean;
  maxLength?: number;
}

const FormField = ({
  name,
  label,
  register,
  errors,
  required,
  maxLength,
}: FormFieldProps) => {
  const registerOptions: any = {
    required: required ? `${label} wajib diisi.` : false,
    maxLength: maxLength
      ? {
          value: maxLength,
          message: `${label} tidak boleh lebih dari ${maxLength} karakter.`,
        }
      : undefined,
  };

  return (
    <div className="flex flex-col">
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            label={label}
            id={name}
            placeholder={label}
            {...register(name, registerOptions)}
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

export default function ItemForm() {
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [unit, setUnit] = useState<ItemUnit | "">("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    // Validasi category dan unit
    if (!category) {
      setErrorMessage("Kategori harus dipilih");
      return;
    }

    if (!unit) {
      setErrorMessage("Satuan harus dipilih");
      return;
    }

    try {
      const response = await fetch("/api/procurement/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: data.itemName.trim(),
          category: ITEM_CATEGORIES[category],
          unit: ITEM_UNITS[unit],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error || "Terjadi kesalahan saat menyimpan bahan"
        );
        return;
      }

      alert("Bahan berhasil disimpan!");
      reset();
      setCategory("");
      setUnit("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error saat menyimpan bahan:", error);
      setErrorMessage("Terjadi kesalahan pada sistem. Silakan coba lagi.");
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
          onValueChange={(value: ItemCategory) => {
            setCategory(value);
            setErrorMessage("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori Bahan" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ITEM_CATEGORIES).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FormField
          name="itemName"
          label="Nama Bahan"
          register={register}
          errors={errors}
          required
          maxLength={255}
        />

        <Select
          value={unit}
          onValueChange={(value: ItemUnit) => {
            setUnit(value);
            setErrorMessage("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Satuan" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ITEM_UNITS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
            {errorMessage}
          </div>
        )}

        <Button type="submit" variant="default">
          Simpan Bahan
        </Button>
      </form>
    </TooltipProvider>
  );
}
