// ProcurementTable.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./ui/table";
import Pagination from "./Pagination";
import { fetchWithAuth } from "../lib/utils";

//struktur data
interface Item {
  id: number;
  itemName: string;
  category: string;
  unit: string | null;
}

interface ProcurementItem {
  id: number;
  itemId: number;
  item: Item;
  initialQuantity: number;
  currentQuantity: number;
  totalPrice: number;
  supplierName: string | null;
  purchaseDate: string;
}

const ProcurementTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProcurementItem | null>(
    null
  );

  const router = useRouter();

  const fetcher = async (url: string) => {
    const response = await fetchWithAuth(url);
    return response.json();
  };

  // Menggunakan SWR
  const { data, error, isLoading, mutate } = useSWR<ProcurementItem[]>(
    "/api/procurement",
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);
  const paginatedData =
    data?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) ||
    [];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  const handleEdit = (id: number) => {
    router.push(`/procurement/edit?id=${id}`);
  };

  const handleDeleteClick = (item: ProcurementItem) => {
    setItemToDelete(item);
    setIsDeleting(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetchWithAuth(
        `/api/procurement?id=${itemToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        mutate(); // Refresh data setelah menghapus
        setItemToDelete(null);
        setIsDeleting(false);
        alert("Data berhasil dihapus!");
      } else {
        alert("Gagal menghapus data pengadaan.");
      }
    } catch (error) {
      console.error("Error deleting procurement:", error);
      alert("Gagal menghapus data pengadaan.");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setItemToDelete(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error memuat data</div>;

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableCaption>Daftar Pengadaan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Item</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Kuantitas Awal</TableHead>
            <TableHead>Stok Saat Ini</TableHead>
            <TableHead>Total Harga</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.item.itemName}</TableCell>
              <TableCell>{item.item.category}</TableCell>
              <TableCell>{`${item.initialQuantity} ${
                item.item.unit || ""
              }`}</TableCell>
              <TableCell>{`${item.currentQuantity} ${
                item.item.unit || ""
              }`}</TableCell>
              <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
              <TableCell>{item.supplierName || "-"}</TableCell>
              <TableCell>
                {new Date(item.purchaseDate).toLocaleDateString("id-ID")}
              </TableCell>
              <TableCell className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item)}
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm"
                >
                  Hapus
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {isDeleting && itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-lg">
              Apakah Anda yakin ingin menghapus data ini?
            </h3>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Hapus
              </button>
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementTable;
