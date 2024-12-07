import { useState } from "react";

interface Product {
  id: number;
  productName: string;
  productionQuantity: number; // Stok produk yang tersedia
}

interface SalesFormProps {
  products: Product[];
  onAddProduct: (product: {
    id: number;
    name: string;
    price: number;
    availableStock: number;
  }) => void;
}

export default function SalesForm({ products, onAddProduct }: SalesFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [price, setPrice] = useState<number | null>(null);

  const handleSelectProduct = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value, 10);
    setSelectedProductId(productId);
    setPrice(null); // Reset harga ketika produk baru dipilih
  };

  const handleAddProduct = () => {
    if (selectedProductId !== null && price !== null) {
      const product = products.find((p) => p.id === selectedProductId);
      if (product) {
        onAddProduct({
          id: product.id,
          name: product.productName,
          price: price,
          availableStock: product.productionQuantity,
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="product-select" className="text-sm font-medium">
        Pilih Produk:
      </label>
      <select
        id="product-select"
        className="border p-2 rounded"
        value={selectedProductId ?? ""}
        onChange={handleSelectProduct}
      >
        <option value="">-- Pilih Produk --</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.productName} (Stok: {product.productionQuantity})
          </option>
        ))}
      </select>

      {selectedProductId !== null && (
        <>
          {/* Input Harga */}
          <label htmlFor="product-price" className="text-sm font-medium">
            Harga Produk:
          </label>
          <input
            type="number"
            id="product-price"
            className="border p-2 rounded"
            value={price ?? ""}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            placeholder="Masukkan harga produk"
          />

          {/* Tambah Produk */}
          <button
            onClick={handleAddProduct}
            className="bg-black text-white p-2 rounded" // Ubah warna tombol menjadi hitam
          >
            Tambah Produk
          </button>
        </>
      )}
    </div>
  );
}
