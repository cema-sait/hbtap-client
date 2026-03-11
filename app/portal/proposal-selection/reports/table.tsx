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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Users,
  Info,
  Eye,
  Layers,
} from "lucide-react";
import { InterventionScoreReport } from "@/types/new/scoring";
import { useRouter } from "next/navigation";



export interface ReportTableProps {
  items: InterventionScoreReport[];
  onViewDetails: (item: InterventionScoreReport) => void;
}


const BRAND = "#27aae1";
const PAGE_SIZES = [25, 50, 75, 100];


/** Pill badge showing scoring status */
function StatusBadge({ item }: { item: InterventionScoreReport }) {
  if (item.is_fully_scored)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        <CheckCircle2 className="h-3 w-3" /> Complete
      </span>
    );
  if (item.criteria_scored > 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        <AlertCircle className="h-3 w-3" /> Partial
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
      <XCircle className="h-3 w-3" /> Not Scored
    </span>
  );
}

function CategoryPills({ categories }: { categories: string[] }) {
  if (!categories || categories.length === 0)
    return <span className="text-slate-300 text-xs italic">No category</span>;

  const visible = categories.slice(0, 2);
  const overflow = categories.slice(2);

  const short = (label: string) => label.replace(/\s*\(.*\)$/, "").trim();

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visible.map((cat) => (
        <Tooltip key={cat}>
          <TooltipTrigger asChild>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border cursor-default leading-tight max-w-[140px] truncate"
              style={{
                background: `${BRAND}10`,
                borderColor: `${BRAND}30`,
                color: BRAND,
              }}
            >
              <Layers className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{short(cat)}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{cat}</TooltipContent>
        </Tooltip>
      ))}
      {overflow.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded cursor-default">
              +{overflow.length} more
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs space-y-0.5">
            {overflow.map((c) => <p key={c}>{c}</p>)}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}


export function ReportTable({ items, onViewDetails }: ReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
    const router = useRouter();

  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Reference
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Intervention
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 min-w-[180px]">
                System Category
              </TableHead>
              <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1">
                  Score
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-slate-300" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Total score across for thi intervention across all criteria and reviewers
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TableHead>
              <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1">
                  Reviewers
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-slate-300" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Reviewers who have scored / total assigned reviewers
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TableHead>
              <TableHead className="w-28 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </TableHead>
              <TableHead className="w-20 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                Details
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-16 text-slate-400 text-sm"
                >
                  No interventions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => {
                const reviewersScored = item.reviewer_statuses.filter(
                  (r) => r.scored
                ).length;

                return (
                  <TableRow
                    key={item.intervention_id}
                    className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0"
                  >
                    {/* Reference */}
                    <TableCell className="align-top pt-3">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                         <button
                          onClick={() =>
                            router.push(`/portal/interventions/${item.intervention_id}`)
                          }
                          className="font-mono  text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
                        >
                          {item.reference_number ?? "—"}
                        </button>  
                      </span>
                    
                    </TableCell>

                    {/* Name */}
                    <TableCell className="align-top pt-3">
                      <p className="font-medium text-sm text-slate-800 leading-snug">
                        {item.intervention_name}
                      </p>
                    </TableCell>

                    {/* System Category */}
                    <TableCell className="align-top pt-3">
                      <CategoryPills categories={item.system_categories ?? []} />
                    </TableCell>

                    {/* Score */}
                    <TableCell className="align-top pt-3">
                      <span className=" center mx-auto font-bold text-slate-800 tabular-nums">
                        {item.overall_total_score}
                      </span>
                    </TableCell>

                    {/* Reviewers */}
                    <TableCell className="align-top pt-3">
                      <span className="flex items-center gap-1.5 text-sm text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="tabular-nums">
                          <strong>{reviewersScored}</strong>
                          <span className="text-slate-400">
                            {" "}/ {item.reviewer_statuses.length}
                          </span>
                        </span>
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-top pt-3">
                      <StatusBadge item={item} />
                    </TableCell>

                    {/* Details */}
                    <TableCell className="text-right align-top pt-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 hover:border-[#27aae1] hover:text-[#27aae1] transition-colors"
                        onClick={() => onViewDetails(item)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Items per page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500 ml-2">
              Showing {startIndex + 1}–{Math.min(endIndex, items.length)} of {items.length}
            </span>
          </div>

          {/* Pagination Controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Number(page));
                      }}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}