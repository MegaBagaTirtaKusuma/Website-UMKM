// components/ItemEdit.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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

export default function ItemEdit() {
  const [loading, setLoading] = useState(true);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemId = searchParams.get("id");

  useEffect(() => {
    if (!itemId) {
      router.push("/item");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/procurement/item/edit?id=${itemId}`);
        const data = await response.json();
        if (response.ok) {
          // Convert the category and unit back to their keys
          const category = Object.entries(ITEM_CATEGORIES).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, value]) => value === data.category
          )?.[0] as ItemCategory;
          const unit = Object.entries(ITEM_UNITS).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, value]) => value === data.unit
          )?.[0] as ItemUnit;
          reset({ ...data, category, unit });
        } else {
          alert("Item not found!");
          router.push("/item");
        }
      } catch (error) {
        console.error("Error fetching item data:", error);
        alert("Failed to fetch item data");
        router.push("/item");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId, reset, router]);

  const onSubmit = async (data: FormValues) => {
    console.log("Submitting data:", data);
    try {
      const response = await fetch(`/api/procurement/item/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          itemName: data.itemName,
          category: ITEM_CATEGORIES[data.category],
          unit: ITEM_UNITS[data.unit],
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Item updated successfully!");
        router.push("/item");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving item data:", error);
      alert("Error updating item.");
    }
  };

  const FormField = ({
    name,
    label,
    type = "text",
    required = false,
    maxLength,
    register,
    errors,
  }: {
    name: keyof FormValues;
    label: string;
    type?: string;
    required?: boolean;
    maxLength?: number;
    register: any;
    errors: any;
  }) => {
    const registerOptions: any = {
      required: required ? `${label} is required.` : false,
      maxLength: maxLength
        ? {
            value: maxLength,
            message: `${label} must not exceed ${maxLength} characters.`,
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
              type={type}
              placeholder={label}
              {...register(name, registerOptions)}
            />
          </TooltipTrigger>
          <TooltipContent>Enter {label.toLowerCase()}</TooltipContent>
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
        <Controller
          name="category"
          control={control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select Item Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ITEM_CATEGORIES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}

        <FormField
          name="itemName"
          label="Nama Bahan"
          register={register}
          errors={errors}
          required
          maxLength={255}
        />

        <Controller
          name="unit"
          control={control}
          rules={{ required: "Unit is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
          )}
        />
        {errors.unit && (
          <p className="text-red-500 text-sm">{errors.unit.message}</p>
        )}

        <Button type="submit" variant="default">
          Simpan Perubahan
        </Button>
      </form>
    </TooltipProvider>
  );
}
