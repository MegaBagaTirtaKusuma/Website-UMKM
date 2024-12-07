"use client";

import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";

// Data structure for production items
interface ProductionItem {
  id: number;
  productName: string;
  productionQuantity: number; // Stok yang tersedia
}

interface SelectedProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
  availableStock: number; // Stok yang tersedia untuk produk yang dipilih
}

export default function SalesPage() {
  const [products, setProducts] = useState<ProductionItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  // Fetch available products from the production page
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/production");
        if (response.ok) {
          const result = await response.json();
          setProducts(result);
        } else {
          console.error("Failed to fetch products.");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSelectProduct = () => {
    if (selectedProduct !== null && price !== null && price > 0) {
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        setSelectedProducts((prev) => [
          ...prev,
          {
            id: product.id,
            name: product.productName,
            price: price,
            quantity: 1,
            availableStock: product.productionQuantity,
          },
        ]);
        setSelectedProduct(null);
        setPrice(null);
      }
    } else {
      alert("Pilih produk dan masukkan harga.");
    }
  };

  const handlePriceChange = (id: number, price: number) => {
    setSelectedProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: price } : item))
    );
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                Math.min(item.quantity + delta, item.availableStock),
                0
              ),
            }
          : item
      )
    );
  };

  // New function to remove selected product
  const handleRemoveProduct = (id: number) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const totalQuantity = selectedProducts.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const totalRevenue = selectedProducts.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  // Function to save sales data and update stock
  const handleSaveSales = async () => {
    if (selectedProducts.length === 0) {
      alert("Tidak ada produk yang dipilih untuk disimpan.");
      return;
    }

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: selectedProducts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save sales data");
      }

      // Update stock for each product and local product state
      await Promise.all(
        selectedProducts.map(async (product) => {
          await fetch("/api/update-stock", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product.id,
              quantity: product.quantity,
            }),
          });

          // Update local product stock
          setProducts((prevProducts) =>
            prevProducts.map((p) =>
              p.id === product.id
                ? {
                    ...p,
                    productionQuantity: p.productionQuantity - product.quantity,
                  }
                : p
            )
          );
        })
      );

      // Alert success message
      alert("Sukses menyimpan data.");

      console.log("Sales data saved and stock updated successfully");
      setSelectedProducts([]); // Clear selected products after saving
    } catch (error) {
      console.error("Error saving sales data:", error);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <PageTitle title="Penjualan" />

      <div className="flex flex-col gap-5">
        <h2 className="text-lg">Pilih Produk</h2>

        <div className="flex flex-col gap-4 w-full">
          {/* Pilih Produk */}
          <select
            value={selectedProduct || ""}
            onChange={(e) => setSelectedProduct(Number(e.target.value))}
            className="border p-2 rounded-lg w-full"
          >
            <option value="">Pilih Produk</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.productName} (Stok: {product.productionQuantity})
              </option>
            ))}
          </select>

          {/* Harga Produk */}
          <Input
            type="number"
            label="Harga Produk"
            placeholder="Harga Produk"
            value={price !== null ? price : ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border p-2 rounded-lg w-full" // Menambahkan gaya yang sama seperti input lainnya
          />

          {/* Tambah Produk */}
          <Button onClick={handleSelectProduct} className="w-full">
            Tambah Produk
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 mt-10">
        <h2 className="text-lg">Produk yang Dipilih</h2>
        {selectedProducts.length > 0 ? (
          selectedProducts.map((product) => (
            <div
              key={product.id}
              className="flex justify-between items-center border p-4 rounded-lg w-full gap-4"
            >
              <span className="flex-grow">{product.name}</span>

              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  label="Harga Produk"
                  placeholder="Harga Produk"
                  value={product.price}
                  onChange={(e) =>
                    handlePriceChange(product.id, Number(e.target.value))
                  }
                  className="border p-2 rounded-lg w-32" // Menambahkan gaya yang sama seperti input lainnya
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleQuantityChange(product.id, -1)}
                  disabled={product.quantity === 0}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  -
                </Button>
                <span className="w-10 text-center">{product.quantity}</span>
                <Button
                  onClick={() => handleQuantityChange(product.id, 1)}
                  disabled={product.quantity >= product.availableStock}
                  className="w-10 h-10 flex items-center justify-center"
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">
                  (Stok: {product.availableStock})
                </span>

                {/* Hapus Produk */}
                <Button
                  onClick={() => handleRemoveProduct(product.id)}
                  className="bg-red-500 text-white"
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p>Belum ada produk yang dipilih.</p>
        )}
      </div>

      <Button
        onClick={handleSaveSales}
        className="bg-black text-white p-2 rounded w-full mt-4"
        disabled={selectedProducts.length === 0}
      >
        Simpan Penjualan
      </Button>

      {/* Laporan Harian */}
      <div className="flex flex-col gap-5 mt-10">
        <h2 className="text-lg">Laporan Harian</h2>
        <div className="border p-4 rounded-lg w-full">
          <p>Total Produk Terjual: {totalQuantity}</p>
          <p>Total Pendapatan: Rp {totalRevenue.toLocaleString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
}
