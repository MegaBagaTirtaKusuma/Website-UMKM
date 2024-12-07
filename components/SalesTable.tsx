// components/SalesTable.tsx
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";

interface SelectedProduct {
  id: number;
  name: string;
  price: number;
  quantity: number;
  availableStock: number; // Stok yang tersedia untuk produk yang dipilih
}

interface SalesTableProps {
  selectedProducts: SelectedProduct[];
  onQuantityChange: (id: number, delta: number) => void;
  onPriceChange: (id: number, price: number) => void;
}

export default function SalesTable({
  selectedProducts,
  onQuantityChange,
  onPriceChange,
}: SalesTableProps) {
  return (
    <div className="flex flex-col gap-5 mt-10">
      <h2 className="text-xl font-bold">Produk yang Dipilih</h2>
      {selectedProducts.length > 0 ? (
        selectedProducts.map((product) => (
          <div
            key={product.id}
            className="flex justify-between items-center border p-4 rounded-lg"
          >
            <span>{product.name}</span>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Harga Produk"
                value={product.price.toFixed(2)} // Menampilkan harga dengan 2 desimal
                onChange={(e) => {
                  const price = parseFloat(e.target.value);
                  onPriceChange(
                    product.id,
                    isNaN(price) || price < 0 ? 0 : price
                  );
                }}
                className="w-24"
                label="Harga" // Menambahkan label di sini
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onQuantityChange(product.id, -1)}
                  disabled={product.quantity === 0}
                  className="bg-black text-white" // Ganti warna tombol
                >
                  -
                </Button>
                <span>{product.quantity}</span>
                <Button
                  onClick={() => onQuantityChange(product.id, 1)}
                  disabled={product.quantity >= product.availableStock}
                  className="bg-black text-white" // Ganti warna tombol
                >
                  +
                </Button>
                <span className="text-sm text-gray-500">
                  (Stok: {product.availableStock})
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Belum ada produk yang dipilih.</p>
      )}
    </div>
  );
}
