"use client";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Build page list with ellipsis
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t-2 border-gray-900 pt-4">
      <p className="text-sm text-gray-600">
        Showing <strong>{start.toLocaleString()}</strong>–
        <strong>{end.toLocaleString()}</strong> of{" "}
        <strong>{totalItems.toLocaleString()}</strong>
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-0.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm border border-gray-400 text-[#1d70b8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e8f0fb] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1d70b8] mr-1"
          aria-label="Previous page"
        >
          ← Prev
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1.5 text-sm text-gray-500 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`w-9 py-1.5 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#1d70b8] ${
                p === currentPage
                  ? "bg-[#1d70b8] text-white border-[#1d70b8] font-bold"
                  : "border-gray-400 text-[#1d70b8] hover:bg-[#e8f0fb]"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm border border-gray-400 text-[#1d70b8] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e8f0fb] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1d70b8] ml-1"
          aria-label="Next page"
        >
          Next →
        </button>
      </nav>
    </div>
  );
}