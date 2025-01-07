"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
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

interface Item {
  id: number;
  itemName: string;
  category: string;
  unit: string | null;
  userId: number;
}

const ItemTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const router = useRouter();

  // Modifikasi fetcher untuk mengembalikan data JSON
  const fetcher = async (url: string) => {
    const response = await fetchWithAuth(url);
    return response.json();
  };

  // Menggunakan SWR dengan fetcher yang sudah dimodifikasi
  const { data, error, isLoading, mutate } = useSWR<Item[]>(
    "/api/procurement/item",
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
    router.push(`/item/edit?id=${id}`);
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setIsDeleting(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetchWithAuth(
        `/api/procurement/item?id=${itemToDelete.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        mutate(); // Refresh data setelah menghapus
        setItemToDelete(null);
        setIsDeleting(false);
        alert("Bahan berhasil dihapus!");
      } else {
        const errorData = await response.json();
        alert(`Gagal menghapus bahan: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error menghapus bahan:", error);
      alert("Gagal menghapus bahan. Terjadi kesalahan pada server.");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleting(false);
    setItemToDelete(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableCaption>Daftar Item</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Item</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.itemName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.unit || "-"}</TableCell>
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

      {/* Modal Konfirmasi Hapus */}
      {isDeleting && itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md">
            <h3 className="text-lg">
              Apakah Anda yakin ingin menghapus item ini?
            </h3>
            <p className="mt-2">Nama Item: {itemToDelete.itemName}</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Hapus
              </button>
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
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

export default ItemTable;
