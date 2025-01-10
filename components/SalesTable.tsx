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

interface Production {
  id: number;
  productName: string;
  productionQuantity: number;
}

interface SalesItem {
  id: number;
  productionId: number;
  production: Production;
  saleQuantity: number;
  salePrice: number;
  totalRevenue: number;
  saleDate: string;
}

const SalesTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SalesItem | null>(null);

  const router = useRouter();

  const fetcher = async (url: string) => {
    const response = await fetchWithAuth(url);
    return response.json();
  };

  const { data, error, isLoading, mutate } = useSWR<SalesItem[]>(
    "/api/sales",
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
    router.push(`/sales/edit?id=${id}`);
  };

  const handleDeleteClick = (item: SalesItem) => {
    setItemToDelete(item);
    setIsDeleting(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetchWithAuth(`/api/sales?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        mutate();
        setItemToDelete(null);
        setIsDeleting(false);
        alert("Data berhasil dihapus!");
      } else {
        alert("Gagal menghapus data penjualan.");
      }
    } catch (error) {
      console.error("Error menghapus penjualan:", error);
      alert("Gagal menghapus data penjualan.");
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
        <TableCaption>Daftar Penjualan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Jumlah Terjual</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Tanggal Penjualan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.production.productName}</TableCell>
              <TableCell>{item.saleQuantity}</TableCell>
              <TableCell>{formatCurrency(item.salePrice)}</TableCell>
              <TableCell>
                {new Date(item.saleDate).toLocaleDateString("id-ID")}
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

export default SalesTable;
