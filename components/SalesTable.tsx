import { useEffect, useState } from "react";
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
import { Button } from "./ui/button"; // Import komponen Button

interface SalesItem {
  id: number;
  productName: string;
  saleDate: string;
  saleQuantity: number;
  salePrice: number;
}

const SalesTable = () => {
  const [data, setData] = useState<SalesItem[]>([]);
  const [filteredData, setFilteredData] = useState<SalesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/sales");
        if (response.ok) {
          const result: SalesItem[] = await response.json();
          setData(result);
          setFilteredData(result);
        } else {
          console.error("Failed to fetch sales data.");
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => {
      const matchesSearch = item.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDate =
        (!startDate || new Date(item.saleDate) >= new Date(startDate)) &&
        (!endDate || new Date(item.saleDate) <= new Date(endDate));

      return matchesSearch && matchesDate;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, data]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
      item.salePrice,
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
            placeholder="Mulai Tanggal"
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
            placeholder="Akhir Tanggal"
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
                {new Date(item.saleDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{item.saleQuantity}</TableCell>
              <TableCell>{item.salePrice}</TableCell>
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
