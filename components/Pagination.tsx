import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}) => {
  // Fungsi untuk mengubah halaman
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  // Fungsi untuk mengubah jumlah item per halaman
  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onItemsPerPageChange(Number(event.target.value));
  };

  return (
    <div className="flex items-center justify-end mt-2 space-x-1">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-1 py-0.5 border rounded text-xs"
        aria-label="Previous page"
      >
        Previous
      </button>

      <span className="px-1 py-0.5 text-xs">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-1 py-0.5 border rounded text-xs"
        aria-label="Next page"
      >
        Next
      </button>

      <select
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
        className="ml-1 border rounded px-1 py-0.5 text-xs"
        aria-label="Items per page"
        title="Select number of items per page"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
};

export default Pagination;
