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

interface Production {
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

export default function SalesForm() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProduction, setSelectedProduction] =
    useState<Production | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const response = await fetch("/api/production");
      if (response.ok) {
        const data = await response.json();
        setProductions(data);
      } else {
        console.error("Gagal mengambil data produksi");
      }
    } catch (error) {
      console.error("Error mengambil data produksi:", error);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedProduction) {
      alert("Silakan pilih produk");
      return;
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          productionId: selectedProduction.id,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Penjualan berhasil disimpan!");
        reset();
        setSelectedProduction(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error saat menyimpan penjualan.");
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
          value={selectedProduction?.id.toString()}
          onValueChange={(value) => {
            const production = productions.find(
              (p) => p.id.toString() === value
            );
            setSelectedProduction(production || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih Produk" />
          </SelectTrigger>
          <SelectContent>
            {productions.map((production) => (
              <SelectItem key={production.id} value={production.id.toString()}>
                {production.productName} (Stok: {production.productionQuantity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProduction && (
          <>
            <FormField
              name="saleQuantity"
              label="Jumlah Penjualan"
              type="number"
              register={register}
              errors={errors}
              required
              maxValue={selectedProduction.productionQuantity}
            />
            <FormField
              name="salePrice"
              label="Harga Jual"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="saleDate"
              label="Tanggal Penjualan"
              type="date"
              register={register}
              errors={errors}
              required
            />
          </>
        )}

        <Button type="submit" variant="default" disabled={!selectedProduction}>
          Simpan Penjualan
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
  maxValue?: number;
}

const FormField = ({
  name,
  label,
  type = "text",
  register,
  errors,
  required,
  maxValue,
}: FormFieldProps) => {
  const [maxDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const registerOptions: any = {
    required: required ? `Kolom ${label} diperlukan.` : false,
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
      message: `${label} harus lebih besar dari 0.`,
    };
    if (maxValue) {
      registerOptions.max = {
        value: maxValue,
        message: `${label} tidak boleh lebih dari ${maxValue}.`,
      };
    }
    registerOptions.validate = (value: number) =>
      value > 0 || `${label} harus lebih besar dari 0.`;
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
