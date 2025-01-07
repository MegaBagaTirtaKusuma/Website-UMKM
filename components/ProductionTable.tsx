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

interface ProductionItem {
  id: number;
  productName: string;
  productionDate: string;
  productionQuantity: number;
  items: {
    itemName: string;
    quantity: number;
    unit: string | null;
  }[];
}

const ProductionTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductionItem | null>(null);

  const router = useRouter();

  const fetcher = async (url: string) => {
    const response = await fetchWithAuth(url);
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<ProductionItem[]>(
    "/api/production",
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

  const handleEdit = (id: number) => {
    router.push(`/production/edit?id=${id}`);
  };

  const handleDeleteClick = (item: ProductionItem) => {
    setItemToDelete(item);
    setIsDeleting(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetchWithAuth(
        `/api/production?id=${itemToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        mutate(); // Refresh data setelah menghapus
        setItemToDelete(null);
        setIsDeleting(false);
        alert("Data produksi berhasil dihapus!");
      } else {
        alert("Gagal menghapus data produksi.");
      }
    } catch (error) {
      console.error("Error menghapus produksi:", error);
      alert("Gagal menghapus data produksi.");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setItemToDelete(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error memuat data</div>;

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableCaption>Daftar Produksi</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Tanggal Produksi</TableHead>
            <TableHead>Jumlah Produksi</TableHead>
            <TableHead>Bahan Produksi</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                {new Date(item.productionDate).toLocaleDateString("id-ID")}
              </TableCell>
              <TableCell>{item.productionQuantity}</TableCell>
              <TableCell>
                {item.items.map((subItem, index) => (
                  <div key={index}>
                    {subItem.itemName} ({subItem.quantity} {subItem.unit || ""})
                  </div>
                ))}
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
              Apakah Anda yakin ingin menghapus data produksi ini?
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

export default ProductionTable;
