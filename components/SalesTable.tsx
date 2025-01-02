import { useState } from "react";
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
import Input from "./ui/input";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Button } from "./ui/button";
import useSWR from "swr";

interface SalesItem {
  id: number;
  productName: string;
  saleDate: string;
  saleQuantity: number;
  salePrice: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SalesTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Menggunakan SWR untuk fetch data dengan auto-revalidation
  const { data, error, isLoading } = useSWR<SalesItem[]>(
    "/api/sales",
    fetcher,
    {
      refreshInterval: 1000, // Refresh setiap 1 detik
      revalidateOnFocus: true, // Refresh saat tab/window mendapat fokus
      revalidateOnReconnect: true, // Refresh saat koneksi internet kembali
    }
  );

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error saat mengambil data. Silakan coba lagi.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  // Filter data berdasarkan pencarian dan tanggal
  const filteredData =
    data?.filter((item) => {
      const matchesSearch = item.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDate =
        (!startDate || new Date(item.saleDate) >= new Date(startDate)) &&
        (!endDate || new Date(item.saleDate) <= new Date(endDate));

      return matchesSearch && matchesDate;
    }) || [];

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text("Daftar Penjualan", 14, 10);

    const tableData = filteredData.map((item) => [
      item.productName,
      new Date(item.saleDate).toLocaleDateString(),
      item.saleQuantity,
      item.salePrice.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      }),
    ]);

    doc.autoTable({
      head: [
        ["Nama Produk", "Tanggal Penjualan", "Jumlah Penjualan", "Harga Jual"],
      ],
      body: tableData,
    });

    doc.save("sales-data.pdf");
  };

  return (
    <div className="overflow-x-auto p-4 border border-gray-300 rounded-lg">
      <div className="flex flex-col md:flex-row gap-4 mb-4 border border-gray-200 p-4 rounded-lg">
        <div className="flex flex-col">
          <label htmlFor="search" className="text-sm text-gray-600">
            Cari Nama Produk
          </label>
          <Input
            id="search"
            placeholder="Cari Nama Produk"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg"
            label={""}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm text-gray-600">
            Mulai Tanggal
          </label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg"
            label={""}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm text-gray-600">
            Akhir Tanggal
          </label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg"
            label={""}
          />
        </div>
      </div>
      <Table className="min-w-full border border-gray-300">
        <TableCaption>Daftar Penjualan</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Tanggal Penjualan</TableHead>
            <TableHead>Jumlah Penjualan</TableHead>
            <TableHead>Harga Jual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id} className="border-b border-gray-300">
              <TableCell>{item.productName}</TableCell>
              <TableCell>
                {new Date(item.saleDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>{item.saleQuantity}</TableCell>
              <TableCell>
                {item.salePrice.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between mt-4">
        <Button onClick={exportToPDF}>Export to PDF</Button>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
};

export default SalesTable;
