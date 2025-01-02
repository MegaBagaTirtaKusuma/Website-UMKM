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
import { useState, useEffect } from "react";

interface Item {
  id: number;
  itemName: string;
  category: string;
  unit: string | null;
}

interface FormValues {
  itemId: number;
  initialQuantity: number;
  totalPrice: number;
  supplierName: string;
  purchaseDate: string;
}

export default function ProcurementForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/procurement/item");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedItem) {
      alert("Please select an item");
      return;
    }

    try {
      const response = await fetch("/api/procurement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          itemId: selectedItem.id,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Pengadaan berhasil disimpan!");
        reset();
        setSelectedItem(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saat menyimpan pengadaan.");
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
          value={selectedItem?.id.toString()}
          onValueChange={(value) => {
            const item = items.find((i) => i.id.toString() === value);
            setSelectedItem(item || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Item" />
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
              label={`Kuantitas (${selectedItem.unit || "Unit"})`}
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
        )}

        <Button type="submit" variant="default" disabled={!selectedItem}>
          Simpan Pengadaan
        </Button>
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
