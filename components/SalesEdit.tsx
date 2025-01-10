"use client";
import { useEffect, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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

export default function SalesEdit() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProduction, setSelectedProduction] =
    useState<Production | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const salesId = searchParams.get("id");

  useEffect(() => {
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

    fetchProductions();

    if (!salesId) {
      router.push("/sales");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/sales/edit?id=${salesId}`);
        const data = await response.json();
        if (response.ok) {
          setSelectedProduction(data.production);
          reset({
            productionId: data.productionId,
            saleQuantity: data.saleQuantity,
            salePrice: data.salePrice,
            saleDate: new Date(data.saleDate).toISOString().split("T")[0],
          });
        } else {
          alert("Data tidak ditemukan!");
          router.push("/sales");
        }
      } catch (error) {
        console.error("Error mengambil data penjualan:", error);
        alert("Gagal mengambil data penjualan");
        router.push("/sales");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [salesId, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`/api/sales/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: salesId, ...data }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Penjualan berhasil diubah!");
        router.push("/sales");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error mengubah penjualan:", error);
      alert("Error mengubah penjualan.");
    }
  };

  const FormField = ({
    name,
    label,
    type = "text",
    required = false,
    maxLength,
  }: {
    name: keyof FormValues;
    label: string;
    type?: string;
    required?: boolean;
    maxLength?: number;
  }) => {
    const [maxDate] = useState(() => new Date().toISOString().split("T")[0]);

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
              {...register(name, {
                required: required ? `${label} wajib diisi.` : false,
                max:
                  type === "date"
                    ? {
                        value: maxDate,
                        message: `${label} tidak boleh lebih besar dari hari ini.`,
                      }
                    : undefined,
                min:
                  type === "number"
                    ? { value: 0, message: `${label} harus 0 atau lebih.` }
                    : undefined,
                maxLength: maxLength
                  ? {
                      value: maxLength,
                      message: `${label} tidak boleh lebih dari ${maxLength} karakter.`,
                    }
                  : undefined,
              })}
              max={type === "date" ? maxDate : undefined}
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
              required
            />
            <FormField
              name="salePrice"
              label="Harga Jual"
              type="number"
              required
            />
            <FormField
              name="saleDate"
              label="Tanggal Penjualan"
              type="date"
              required
            />
          </>
        )}

        <Button type="submit" variant="default" disabled={!selectedProduction}>
          Simpan Perubahan
        </Button>
      </form>
    </TooltipProvider>
  );
}
