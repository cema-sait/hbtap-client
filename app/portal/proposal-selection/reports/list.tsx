"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, List, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { EnrichedInterventionScore } from "@/types/new/scoring";
import { getInterventionScores } from "@/app/api/new/client";

const BRAND = "#27aae1";
const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];

// ─── Score checkboxes: 1 2 3 — selected value highlighted ────────────────────
function ScoreCheckboxes({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3].map((opt) => {
        const active = opt === value;
        return (
          <span
            key={opt}
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border transition-colors",
              active ? "text-white border-transparent" : "bg-slate-50 text-slate-400 border-slate-200"
            )}
            style={active ? { background: BRAND, borderColor: BRAND } : undefined}
          >
            {active ? <CheckSquare className="h-3 w-3 shrink-0" /> : <Square className="h-3 w-3 shrink-0" />}
            {opt}
          </span>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ScoreList() {
  const [scores, setScores] = useState<EnrichedInterventionScore[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterReviewer, setFilterReviewer] = useState<string>("all");
  const [filterIntervention, setFilterIntervention] = useState<string>("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInterventionScores();
      setScores(data as unknown as EnrichedInterventionScore[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [searchText, filterReviewer, filterIntervention, pageSize]);

  // ── Unique reviewers ──────────────────────────────────────────────────────
  const reviewerOptions = useMemo(() => {
    const seen = new Map<string, string>();
    scores.forEach((s) => {
      const id = String(s.reviewer);
      if (!seen.has(id)) seen.set(id, s.reviewer_name || `Reviewer ${id}`);
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [scores]);

  // ── Unique interventions ──────────────────────────────────────────────────
  const interventionOptions = useMemo(() => {
    const seen = new Map<string, string>();
    scores.forEach((s) => {
      if (!seen.has(s.intervention)) {
        seen.set(
          s.intervention,
          `${s.intervention_reference ? s.intervention_reference + " — " : ""}${s.intervention_name}`
        );
      }
    });
    return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));
  }, [scores]);

  // ── Filtered ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let items = scores;

    if (filterReviewer !== "all") {
      items = items.filter((s) => String(s.reviewer) === filterReviewer);
    }
    if (filterIntervention !== "all") {
      items = items.filter((s) => s.intervention === filterIntervention);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      items = items.filter((s) =>
        s.score?.criteria_label?.toLowerCase().includes(q) ||
        s.score?.scoring_mechanism?.toLowerCase().includes(q) ||
        s.intervention_name?.toLowerCase().includes(q) ||
        s.intervention_reference?.toLowerCase().includes(q) ||
        s.reviewer_name?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [scores, filterReviewer, filterIntervention, searchText]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md" style={{ background: `${BRAND}15` }}>
            <List className="h-4 w-4" style={{ color: BRAND }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Score List</h2>
            <p className="text-xs text-slate-500">
              All individual scores submitted · filter by intervention or reviewer
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Text search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search criteria, intervention..."
            className="pl-9 h-8 text-sm bg-white"
          />
        </div>

        {/* Intervention filter */}
        <Select value={filterIntervention} onValueChange={setFilterIntervention}>
          <SelectTrigger className="h-8 w-56 text-sm bg-white">
            <SelectValue placeholder="All interventions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All interventions</SelectItem>
            {interventionOptions.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                <span className="truncate max-w-[220px] block">{label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reviewer filter */}
        <Select value={filterReviewer} onValueChange={setFilterReviewer}>
          <SelectTrigger className="h-8 w-44 text-sm bg-white">
            <SelectValue placeholder="All reviewers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reviewers</SelectItem>
            {reviewerOptions.map(({ id, label }) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Page size */}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
          <span className="whitespace-nowrap">Rows</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="h-8 w-20 text-xs bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">
        <strong className="text-slate-700">{filtered.length}</strong> score{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== scores.length && (
          <span className="text-slate-400"> (filtered from {scores.length})</span>
        )}
      </p>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="w-8 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">#</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Intervention</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Criteria</TableHead>
                <TableHead className="w-40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reviewer</TableHead>
                <TableHead className="w-36 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Score (1–3)</TableHead>
                <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                    No scores found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((s, idx) => {
                  const scoreValue = s.score?.score_value ?? 0;
                  const mechanism = s.score?.scoring_mechanism ?? "—";
                  const criteriaLabel = s.score?.criteria_label ?? "—";

                  return (
                    <TableRow
                      key={s.id}
                      className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                    >
                      {/* # */}
                      <TableCell className="text-center text-xs text-slate-400 font-mono">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>

                      {/* Intervention */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {s.intervention_reference && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                              {s.intervention_reference}
                            </span>
                          )}
                          <p className="text-sm font-medium text-slate-800 leading-snug">
                            {s.intervention_name || "—"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Criteria */}
                      <TableCell>
                        <p className="text-sm text-slate-700 leading-snug">{criteriaLabel}</p>
                        <Badge variant="secondary" className="text-xs font-normal mt-1">
                          {mechanism}
                        </Badge>
                        {s.comment && (
                          <p className="text-xs text-slate-400 mt-1 italic truncate max-w-xs">
                            {s.comment}
                          </p>
                        )}
                      </TableCell>

                      {/* Reviewer */}
                      <TableCell>
                        <p className="text-sm font-medium text-slate-700 leading-none">
                          {s.reviewer_name || `Reviewer #${s.reviewer}`}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{s.reviewer_email}</p>
                      </TableCell>

                      {/* Score */}
                      <TableCell>
                        <ScoreCheckboxes value={scoreValue} />
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-xs text-slate-500">
                          {new Date(s.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <strong className="text-slate-700">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)}
            </strong>{" "}
            of <strong className="text-slate-700">{filtered.length}</strong>
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn(page === 1 && "pointer-events-none opacity-40")}
                />
              </PaginationItem>
              {pageNumbers.map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={page === p}
                      onClick={() => setPage(p as number)}
                      style={page === p ? { background: BRAND, borderColor: BRAND, color: "#fff" } : undefined}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(page === totalPages && "pointer-events-none opacity-40")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}