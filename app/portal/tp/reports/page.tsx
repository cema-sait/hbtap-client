"use client";

import { useEffect, useState, useCallback, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  RefreshCw,
  BarChart3,
  Download,
  CheckCircle2,
  XCircle,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

import { ScoringReportResult, InterventionScoreReport } from "@/types/new/scoring";
import { getScoringReport } from "@/app/api/new/scoring";
import { ScoreList } from "./list";
import { FilterStatus, ReportFilters } from "./filters";
import { exportScoringReportCSV } from "./utils";
import { ReportTable } from "./table";
import { InterventionDetailDialog } from "./dialogue";
import { ScoringAnalytics } from "./analytics";


const BRAND = "#27aae1";

export default function ScoringReportPage() {
  const [report, setReport] = useState<ScoringReportResult | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [selectedItem, setSelectedItem] = useState<InterventionScoreReport | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setInitialLoading(true);
    setError(null);

    try {
      const result = await getScoringReport();
      if (!result.success) {
        setError(result.message ?? "Failed to load scoring report.");
      } else {
        setReport(result);
      }
    } catch {
      setError("Failed to load scoring report. Please check your connection and try again.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(false); }, [load]);

  const handleRefresh = () => load(true);

  const allCategories = useMemo(() => {
    if (!report) return [];
    const set = new Set<string>();
    report.interventions.forEach((i) =>
      (i.system_categories ?? []).forEach((c) => set.add(c))
    );
    return Array.from(set).sort();
  }, [report]);

  const filtered = useMemo(() => {
    if (!report) return [];
    let items = report.interventions;

    if (statusFilter === "fully_scored")
      items = items.filter((i) => i.is_fully_scored);
    else if (statusFilter === "partial")
      items = items.filter((i) => !i.is_fully_scored && i.criteria_scored > 0);
    else if (statusFilter === "not_scored")
      items = items.filter((i) => i.criteria_scored === 0);

    if (categoryFilter === "__none__") {
      items = items.filter(
        (i) => !i.system_categories || i.system_categories.length === 0
      );
    } else if (categoryFilter) {
      items = items.filter((i) =>
        (i.system_categories ?? []).includes(categoryFilter)
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.intervention_name.toLowerCase().includes(q) ||
          i.reference_number.toLowerCase().includes(q) ||
          (i.system_categories ?? []).some((c) => c.toLowerCase().includes(q))
      );
    }

    return items;
  }, [report, statusFilter, categoryFilter, search]);


  const handleExport = () => {
    if (!report || filtered.length === 0) return;
    exportScoringReportCSV(filtered);
    toast.success(
      `Exported ${filtered.length} intervention${filtered.length !== 1 ? "s" : ""} to CSV.`
    );
  };

  const handleSearchChange = (v: string) =>
    startTransition(() => setSearch(v));
  const handleStatusChange = (v: FilterStatus) =>
    startTransition(() => setStatusFilter(v));
  const handleCategoryChange = (v: string) =>
    startTransition(() => setCategoryFilter(v));

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5 relative">

        <div
          className={cn(
            "absolute inset-x-0 -top-1 h-0.5 overflow-hidden rounded-full transition-opacity duration-300",
            refreshing ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden="true"
        >
          <div
            className="h-full w-1/2 animate-[swipe_1.4s_ease-in-out_infinite]"
            style={{ background: BRAND }}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}
            >
              <BarChart3 className="h-5 w-5" style={{ color: BRAND }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Scoring Report
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Intervention scores, reviewer participation, and progress overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!report || initialLoading || filtered.length === 0}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              Export CSV
              {filtered.length > 0 && report && (
                <span className="ml-1 text-[10px] font-medium text-slate-400 tabular-nums">
                  ({filtered.length})
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={initialLoading || refreshing}
              aria-label="Refresh report"
            >
              <RefreshCw
                className={cn("h-4 w-4", (refreshing) && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {initialLoading && <ReportSkeleton />}
        {!initialLoading && report && (
          <div
            className={cn(
              "flex flex-col gap-5 transition-opacity duration-200",
              refreshing && "opacity-60 pointer-events-none"
            )}
          >

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatCard
                label="Total Interventions"
                value={report.total_interventions}
                icon={<BarChart3 className="h-4 w-4" />}
              />

              <StatCard
                label="Not Scored"
                value={report.not_scored}
                icon={<XCircle className="h-4 w-4" />}
                color="#94a3b8"
              />
              <StatCard
                label="Active Reviewers"
                value={report.total_reviewers}
                icon={<Users className="h-4 w-4" />}
                color={BRAND}
              />
            </div>

            {/* Filters toolbar */}
            <ReportFilters
              search={search}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusChange}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={handleCategoryChange}
              categories={allCategories}
              shownCount={filtered.length}
              totalCount={report.total_interventions}
            />

            {/* Data table */}
            <ReportTable items={filtered} onViewDetails={setSelectedItem} />

            {/* Footer hint */}
            <p className="text-xs text-slate-400 text-center pb-2">
              Click <strong>View</strong> on any row for reviewer participation details.{" "}
              Export CSV respects active filters and includes per-reviewer columns.
            </p>

{/* 
            <div className="border-t border-slate-200 pt-6">
  <ScoringAnalytics report={report} />
</div> */}

            <div className="border-t border-slate-200 pt-6">
              <ScoreList />
            </div>
          </div>
        )}
      </div>

      {/* Detail modal — outside scroll container to avoid clipping */}
      <InterventionDetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Animation keyframe for the refresh progress bar */}
      <style jsx global>{`
        @keyframes swipe {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </TooltipProvider>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = "#1e293b",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <div className="rounded-lg p-2 shrink-0" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-xl font-bold tracking-tight mt-0.5 tabular-nums" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse" aria-hidden="true">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 h-[72px] flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 h-9 w-9 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2 bg-slate-100 rounded w-3/4" />
              <div className="h-5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="h-9 bg-slate-100 rounded-lg flex-1 max-w-sm" />
        <div className="h-9 bg-slate-100 rounded-lg w-44" />
        <div className="h-9 bg-slate-100 rounded-lg w-56" />
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="h-10 bg-slate-50 border-b border-slate-200" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100 last:border-0"
          >
            <div className="h-5 bg-slate-100 rounded w-24 shrink-0" />
            <div className="h-4 bg-slate-100 rounded flex-1" />
            <div className="h-5 bg-slate-100 rounded w-32 shrink-0" />
            <div className="h-5 bg-slate-100 rounded w-14 shrink-0" />
            <div className="h-5 bg-slate-100 rounded w-16 shrink-0" />
            <div className="h-5 bg-slate-100 rounded w-20 shrink-0" />
            <div className="h-7 bg-slate-100 rounded w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}