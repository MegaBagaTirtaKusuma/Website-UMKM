// components/ItemForm.tsx
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

type ItemUnit = (typeof ITEM_UNITS)[keyof typeof ITEM_UNITS];
type ItemCategory = (typeof ITEM_CATEGORIES)[keyof typeof ITEM_CATEGORIES];

interface FormValues {
  itemName: string;
  category: ItemCategory;
  unit?: ItemUnit;
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
    required: required ? `Kolom ${label} diperlukan.` : false,
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("/api/procurement/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          category,
          unit, // Include unit in the request body
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Bahan berhasil disimpan!");
        reset();
        setCategory("");
        setUnit(""); // Reset unit state
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saat menyimpan bahan.");
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
          onValueChange={(value: ItemCategory) => setCategory(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Kategori Bahan" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ITEM_CATEGORIES).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
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
          onValueChange={(value: ItemUnit) => setUnit(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Satuan" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ITEM_UNITS).map((unitOption) => (
              <SelectItem key={unitOption} value={unitOption}>
                {unitOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" variant="default">
          Simpan Bahan
        </Button>
      </form>
    </TooltipProvider>
  );
}
