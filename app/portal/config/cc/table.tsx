"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

const PAGE_SIZES = [25, 50, 75, 100];

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  width?: string; // e.g. "w-32" or "w-[120px]"
}

export interface CategoryFilterOption {
  id: string;
  name: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  // Category filter
  categories?: CategoryFilterOption[];
  categoryFilterFn?: (row: T, categoryId: string) => boolean;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Search...",
  searchFn,
  categories,
  categoryFilterFn,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = data.filter((row) => {
    const matchesSearch = query && searchFn
      ? searchFn(row, query.toLowerCase())
      : true;
    const matchesCategory = selectedCategory !== "all" && categoryFilterFn
      ? categoryFilterFn(row, selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const rows = filtered.slice(start, start + pageSize);
  const from = filtered.length > 0 ? start + 1 : 0;
  const to = Math.min(start + pageSize, filtered.length);

  const goTo = (p: number) => setPage(Math.min(Math.max(0, p), totalPages - 1));
  const resetPage = () => setPage(0);

  const activeFilters = (query ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {searchFn && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); resetPage(); }}
              className="pl-9 h-8 text-sm bg-white border-slate-200"
            />
          </div>
        )}

        {/* Category filter */}
        {categories && categories.length > 0 && (
          <Select
            value={selectedCategory}
            onValueChange={(v) => { setSelectedCategory(v); resetPage(); }}
          >
            <SelectTrigger className="h-8 w-56 text-sm border-slate-200 bg-white">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all" className="text-sm">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-sm">
                  <span className="truncate block max-w-[220px]">{cat.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Active filter chips */}
        {activeFilters > 0 && (
          <button
            onClick={() => { setQuery(""); setSelectedCategory("all"); resetPage(); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2 h-8 bg-white transition-colors"
          >
            <X className="h-3 w-3" />
            Clear filters
            <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              {activeFilters}
            </Badge>
          </button>
        )}

        {/* Page size — pushed right */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="text-xs text-slate-400 whitespace-nowrap">Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => { setPageSize(Number(v)); resetPage(); }}
          >
            <SelectTrigger className="h-8 w-16 text-xs border-slate-200 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={`text-xs font-semibold uppercase tracking-wide text-slate-400 py-2.5 whitespace-nowrap ${col.width ?? ""} ${col.className ?? ""}`}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? rows.map((row, i) => (
                <TableRow
                  key={i}
                  className="border-slate-100 hover:bg-slate-50/60 transition-colors"
                >
                  {columns.map((col, j) => (
                    <TableCell
                      key={j}
                      className={`py-3 align-top max-w-0 overflow-hidden ${col.width ?? ""} ${col.className ?? ""}`}
                    >
                      {col.cell ? col.cell(row) : col.accessor ? String(row[col.accessor] ?? "—") : null}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-slate-400">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            {from}–{to} of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-slate-200"
              onClick={() => goTo(safePage - 1)}
              disabled={safePage === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-slate-500">
              {safePage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-slate-200"
              onClick={() => goTo(safePage + 1)}
              disabled={safePage >= totalPages - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}