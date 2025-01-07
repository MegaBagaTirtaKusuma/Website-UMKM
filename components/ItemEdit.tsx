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
  const [errorMessage, setErrorMessage] = useState<string>("");
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const category = Object.entries(ITEM_CATEGORIES).find(
            ([key, value]) => value === data.category
          )?.[0] as ItemCategory;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const unit = Object.entries(ITEM_UNITS).find(
            ([key, value]) => value === data.unit
          )?.[0] as ItemUnit;
          reset({ ...data, category, unit });
        } else {
          alert("Bahan tidak ditemukan!");
          router.push("/item");
        }
      } catch (err) {
        console.error("Error mengambil data bahan:", err);
        setErrorMessage("Gagal mengambil data bahan");
        alert("Gagal mengambil data bahan");
        router.push("/item");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`/api/procurement/item/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          itemName: data.itemName.trim(),
          category: ITEM_CATEGORIES[data.category],
          unit: data.unit ? ITEM_UNITS[data.unit] : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.log("Error response:", result);
        setErrorMessage(
          result.message || "Terjadi kesalahan saat menyimpan perubahan"
        );
        return;
      }

      alert("Bahan berhasil diubah!");
      setErrorMessage("");
      router.push("/item");
    } catch (err) {
      console.error("Error mengubah bahan:", err);
      setErrorMessage("Terjadi kesalahan pada sistem. Silakan coba lagi.");
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
      required: required ? `${label} wajib diisi.` : false,
      maxLength: maxLength
        ? {
            value: maxLength,
            message: `${label} tidak boleh lebih besar dari ${maxLength} karakter.`,
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
        <Controller
          name="category"
          control={control}
          rules={{ required: "Kategori wajib diisi" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
          rules={{ required: "Satuan wajib diisi" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Satuan Bahan" />
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

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">
            {errorMessage}
          </div>
        )}

        <Button type="submit" variant="default">
          Simpan Perubahan
        </Button>
      </form>
    </TooltipProvider>
  );
}
