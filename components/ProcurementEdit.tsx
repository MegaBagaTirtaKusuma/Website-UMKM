"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";

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
  currentQuantity?: number;
  unit?: ProcurementUnit;
  totalPrice: number;
  supplierName?: string;
  purchaseDate: Date;
}

export default function ProcurementEdit() {
  const [category, setCategory] = useState<ProcurementCategory | "">("");
  const [loading, setLoading] = useState(true);
  const [procurementData, setProcurementData] = useState<FormValues | null>(
    null
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const procurementId = searchParams.get("id");

  useEffect(() => {
    if (!procurementId) {
      router.push("/procurement");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/procurement/edit?id=${procurementId}`
        );
        const data = await response.json();
        if (response.ok) {
          setProcurementData(data);
          setCategory(data.category);
          reset({
            ...data,
            purchaseDate: data.purchaseDate,
            initialQuantity: data.initialQuantity,
            currentQuantity: data.currentQuantity,
          });
        } else {
          alert("Data not found!");
          router.push("/procurement");
        }
      } catch (error) {
        console.error("Error fetching procurement data:", error);
        alert("Failed to fetch procurement data");
        router.push("/procurement");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [procurementId, reset, router]);

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch(`/api/procurement/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: procurementId, ...data, category }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Procurement updated successfully!");
        router.push("/procurement");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving procurement data:", error);
      alert("Error updating procurement.");
    }
  };

  const FormField: React.FC<{
    name: string;
    label: string;
    type?: string;
    step?: string;
    register: any;
    errors: any;
    required?: boolean;
  }> = ({ name, label, type = "text", step, register, errors, required }) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-2">
        {label}
      </label>
      <input
        id={name}
        type={type}
        step={step}
        {...register(name, {
          required: required ? `${label} is required` : false,
        })}
        className="border p-2 rounded"
      />
      {errors[name] && (
        <p className="text-red-500 text-sm">{errors[name]?.message}</p>
      )}
    </div>
  );

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
            />
            <div className="flex gap-2">
              <div className="flex-1 min-w-[100px] w-full">
                <FormField
                  name="initialQuantity"
                  label="Kuantitas Awal"
                  type="number"
                  step="0.01"
                  register={register}
                  errors={errors}
                  required
                />
                <FormField
                  name="currentQuantity"
                  label="Kuantitas Sekarang"
                  type="number"
                  step="0.01"
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
              step="0.01"
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
            />
            <FormField
              name="initialQuantity"
              label="Kuantitas Awal"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="currentQuantity"
              label="Kuantitas Sekarang"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              required
            />
            <FormField
              name="totalPrice"
              label="Harga Total"
              type="number"
              step="0.01"
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
            />
            <FormField
              name="totalPrice"
              label="Biaya Perbaikan"
              type="number"
              step="0.01"
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
            />
            <FormField
              name="totalPrice"
              label="Biaya Transportasi/Pengiriman"
              type="number"
              step="0.01"
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
            />
            <FormField
              name="totalPrice"
              label="Biaya Tagihan"
              type="number"
              step="0.01"
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
            />
            <FormField
              name="totalPrice"
              label="Biaya Promosi"
              type="number"
              step="0.01"
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

  if (loading) return <div>Loading...</div>;

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            Simpan Perubahan
          </Button>
        )}
      </form>
    </TooltipProvider>
  );
}
