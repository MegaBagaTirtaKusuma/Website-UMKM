"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { fetchWithAuth } from "../lib/utils";

interface ExportFormValues {
  startDate: string;
  endDate: string;
  format: string;
}

export default function SalesExport() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExportFormValues>();

  const onSubmit = async (data: ExportFormValues) => {
    try {
      const queryString = new URLSearchParams({
        startDate: data.startDate,
        endDate: data.endDate,
        format: data.format,
      }).toString();

      const response = await fetchWithAuth(`/api/sales/export?${queryString}`, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales-report.${data.format === "pdf" ? "pdf" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Error mengekspor data");
      }
    } catch (error) {
      console.error("Error mengekspor data:", error);
      alert("Error mengekspor data");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        type="date"
        label="Tanggal Mulai"
        {...register("startDate", { required: "Tanggal mulai diperlukan" })}
        error={
          errors.startDate ? { message: errors.startDate.message } : undefined
        }
      />
      <Input
        type="date"
        label="Tanggal Akhir"
        {...register("endDate", { required: "Tanggal akhir diperlukan" })}
        error={errors.endDate ? { message: errors.endDate.message } : undefined}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Format
        </label>
        <select
          {...register("format", { required: "Pilih format file" })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
        </select>
        {errors.format && (
          <p className="text-red-500">{errors.format.message}</p>
        )}
      </div>
      <Button type="submit" variant="default">
        Ekspor
      </Button>
    </form>
  );
}
