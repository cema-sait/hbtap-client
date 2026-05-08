"use client";


import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InterventionPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function buildPages(page: number, totalPages: number): (number | "ellipsis")[] {
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (page > 3) pages.push("ellipsis");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function InterventionPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: InterventionPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const pages = buildPages(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      {/* Count label */}
      <p className="text-xs text-slate-500">
        Showing{" "}
        <strong className="text-slate-700">{from}–{to}</strong> of{" "}
        <strong className="text-slate-700">{totalItems}</strong> interventions
      </p>

      {/* Page controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* Prev */}
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded border text-sm transition-colors",
            page === 1
              ? "border-slate-200 text-slate-300 cursor-not-allowed"
              : "border-slate-200 text-slate-600 hover:border-[#27aae1] hover:text-[#27aae1]"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "h-8 min-w-8 px-2 flex items-center justify-center rounded border text-sm font-medium transition-colors",
                page === p
                  ? "bg-[#27aae1] border-[#27aae1] text-white"
                  : "border-slate-200 text-slate-600 hover:border-[#27aae1] hover:text-[#27aae1]"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded border text-sm transition-colors",
            page === totalPages
              ? "border-slate-200 text-slate-300 cursor-not-allowed"
              : "border-slate-200 text-slate-600 hover:border-[#27aae1] hover:text-[#27aae1]"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}