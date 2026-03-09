"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw, BarChart3, Search, Download, Eye,
  CheckCircle2, AlertCircle, XCircle, Users, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

import { ScoringReportResult, InterventionScoreReport } from "@/types/new/scoring";
import { getScoringReport } from "@/app/api/new/scoring";
import { ScoreList } from "./list";


const BRAND = "#27aae1";

type FilterStatus = "all" | "fully_scored" | "partial" | "not_scored";

// ─── Detail Dialog ─────────────────────────────────────────────────────────────
function InterventionDetailDialog({
  item,
  open,
  onClose,
}: {
  item: InterventionScoreReport | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;

  const pct =
    item.max_possible_score > 0
      ? Math.round((item.overall_total_score / item.max_possible_score) * 100)
      : 0;

  const scored = item.reviewer_statuses.filter((r) => r.scored);
  const notScored = item.reviewer_statuses.filter((r) => !r.scored);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-lg mt-0.5 shrink-0"
              style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}25` }}
            >
              <BarChart3 className="h-4 w-4" style={{ color: BRAND }} />
            </div>
            <div>
              <DialogTitle className="text-base leading-snug">
                {item.intervention_name}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                  {item.reference_number}
                </span>
                {item.intervention_type && (
                  <Badge variant="secondary" className="text-xs">{item.intervention_type}</Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-1">

          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Score</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{item.overall_total_score}</p>
              <p className="text-[11px] text-slate-400">of {item.max_possible_score}</p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Score %</p>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ color: pct >= 75 ? "#059669" : pct >= 40 ? BRAND : "#f59e0b" }}
              >
                {pct}%
              </p>
              <p className="text-[11px] text-slate-400">of max possible</p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Criteria</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums">{item.criteria_scored}</p>
              <p className="text-[11px] text-slate-400">of {item.criteria_total} filled</p>
            </div>
          </div>

          {/* Criteria progress dots */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Criteria Coverage
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Array.from({ length: item.criteria_total }, (_, i) => (
                <div
                  key={i}
                  className="h-2.5 w-6 rounded-sm"
                  style={{ background: i < item.criteria_scored ? BRAND : "#e2e8f0" }}
                />
              ))}
              <span className="text-xs text-slate-500 ml-1">
                {item.criteria_scored}/{item.criteria_total} scored
              </span>
            </div>
          </div>

          {/* Reviewers who scored */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Scored ({scored.length})
            </p>
            {scored.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No reviewers have scored this intervention yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {scored.map((r) => (
                  <div
                    key={r.user_id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-emerald-800 leading-none">{r.full_name}</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        {r.score_count} criteria ·{" "}
                        <span className="font-semibold">{r.user_total_score} pts</span>
                        {" · "}{r.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewers who have NOT scored */}
          {notScored.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                Not Yet Scored ({notScored.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {notScored.map((r) => (
                  <div
                    key={r.user_id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-600 leading-none">{r.full_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ScoringReportPage() {
  const [report, setReport] = useState<ScoringReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [selectedItem, setSelectedItem] = useState<InterventionScoreReport | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getScoringReport();
      if (!result.success) setError(result.message);
      else setReport(result);
    } catch {
      setError("Failed to load scoring report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!report) return [];
    let items = report.interventions;

    if (statusFilter === "fully_scored") items = items.filter((i) => i.is_fully_scored);
    else if (statusFilter === "partial") items = items.filter((i) => !i.is_fully_scored && i.criteria_scored > 0);
    else if (statusFilter === "not_scored") items = items.filter((i) => i.criteria_scored === 0);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.intervention_name.toLowerCase().includes(q) ||
          i.reference_number.toLowerCase().includes(q)
      );
    }
    return items;
  }, [report, statusFilter, search]);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!report) return;
    const reviewerHeaders =
      report.interventions[0]?.reviewer_statuses.map((r) => `Reviewer: ${r.full_name}`) ?? [];
    const headers = [
      "Reference", "Intervention Name", "Type",
      "Total Score",
      "Criteria Scored", "Criteria Total", "Status",
      ...reviewerHeaders,
    ];
    const rows = filtered.map((i) => [
      i.reference_number,
      `"${i.intervention_name}"`,
      i.intervention_type ?? "",
      i.overall_total_score,
      i.criteria_scored,
      i.criteria_total,
      i.is_fully_scored ? "Fully Scored" : i.criteria_scored > 0 ? "Partial" : "Not Scored",
      ...i.reviewer_statuses.map((r) =>
        r.scored ? `Scored (${r.score_count} criteria, ${r.user_total_score} pts)` : "Not Scored"
      ),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scoring-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported.");
  };

  const scorePercent = (item: InterventionScoreReport) =>
    item.max_possible_score > 0
      ? Math.round((item.overall_total_score / item.max_possible_score) * 100)
      : 0;

  const StatusBadge = ({ item }: { item: InterventionScoreReport }) => {
    if (item.is_fully_scored)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" /> Complete
        </span>
      );
    if (item.criteria_scored > 0)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <AlertCircle className="h-3 w-3" /> Partial
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
        <XCircle className="h-3 w-3" /> Not Scored
      </span>
    );
  };


  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: `${BRAND}18`, border: `1px solid ${BRAND}30` }}>
              <BarChart3 className="h-5 w-5" style={{ color: BRAND }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Scoring Report</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Intervention scores, reviewer participation, and progress overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={!report || loading}>
              <Download className="h-4 w-4 mr-1.5" /> Export CSV
            </Button>
            <Button variant="outline" size="icon" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <XCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <RefreshCw className="h-7 w-7 animate-spin text-slate-300" />
          </div>
        ) : report && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Interventions" value={report.total_interventions} icon={<BarChart3 className="h-4 w-4" />} />
              <StatCard label="Fully Scored" value={report.fully_scored} icon={<CheckCircle2 className="h-4 w-4" />} color="#059669" />
              {/* <StatCard label="Partially Scored" value={report.partially_scored} icon={<AlertCircle className="h-4 w-4" />} color="#d97706" /> */}
              <StatCard label="Not Scored" value={report.not_scored} icon={<XCircle className="h-4 w-4" />} color="#94a3b8" />
              <StatCard label="Active Reviewers" value={report.total_reviewers} icon={<Users className="h-4 w-4" />} color={BRAND} />
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search interventions..."
                  className="pl-9 h-8 text-sm bg-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
                <SelectTrigger className="h-8 w-44 text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="fully_scored">Complete</SelectItem>
                  <SelectItem value="partial">Partially Scored</SelectItem>
                  <SelectItem value="not_scored">Not Scored</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-500 ml-auto">
                {filtered.length} of {report.total_interventions} shown
              </span>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                    <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Reference</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Intervention</TableHead>
                    <TableHead className="w-24 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Type</TableHead>
                    <TableHead className="w-32 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        Score
                        <Tooltip>
                          <TooltipTrigger><Info className="h-3 w-3 text-slate-300" /></TooltipTrigger>
                          <TooltipContent>Total score vs maximum possible across all criteria</TooltipContent>
                        </Tooltip>
                      </span>
                    </TableHead>
                
                    <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <span className="flex items-center gap-1">
                        Reviewers
                        <Tooltip>
                          <TooltipTrigger><Info className="h-3 w-3 text-slate-300" /></TooltipTrigger>
                          <TooltipContent>Reviewers who have scored / total reviewers</TooltipContent>
                        </Tooltip>
                      </span>
                    </TableHead>
                    <TableHead className="w-28 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</TableHead>
                    <TableHead className="w-20 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                        No interventions match the current filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((item) => {
                      const pct = scorePercent(item);
                      const reviewersScored = item.reviewer_statuses.filter((r) => r.scored).length;

                      return (
                        <TableRow
                          key={item.intervention_id}
                          className="hover:bg-slate-50/70 transition-colors border-b border-slate-100"
                        >
   
                          <TableCell>
                            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {item.reference_number}
                            </span>
                          </TableCell>


                          <TableCell>
                            <p className="font-medium text-sm text-slate-800 leading-snug">
                              {item.intervention_name}
                            </p>
                          </TableCell>

                          {/* Type */}
                          <TableCell>
                            {item.intervention_type
                              ? <Badge variant="secondary" className="text-xs">{item.intervention_type}</Badge>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </TableCell>

                          {/* Score */}
                          <TableCell>
                            <span className="text-sm font-semibold text-slate-800 tabular-nums">
                              {item.overall_total_score}
                            </span>
                            {/* <span className="text-xs text-slate-400"> / {item.max_possible_score}</span> */}
                          </TableCell>

                          {/* Score bar */}
                          {/* <TableCell><ScoreBar pct={pct} /></TableCell> */}

                          {/* Reviewer count */}
                          <TableCell>
                            <span className="flex items-center gap-1.5 text-sm text-slate-700">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span className="tabular-nums">
                                <strong>{reviewersScored}</strong>
                                <span className="text-slate-400"> / {item.reviewer_statuses.length}</span>
                              </span>
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell><StatusBadge item={item} /></TableCell>

                          {/* Details button */}
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={() => setSelectedItem(item)}
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

            <p className="text-xs text-slate-400 text-center pb-2">
              Click <strong>View</strong> on any row to see reviewer participation details · Export CSV includes all reviewer columns
            </p>

            <div className="border-t border-slate-200 pt-6">
              <ScoreList />
            </div>
          </>
        )}
      </div>

      {/* Detail dialog */}
      <InterventionDetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </TooltipProvider>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, color = "#1e293b",
}: {
  label: string; value: number; icon: React.ReactNode; color?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm flex items-center gap-3">
      <div className="rounded-lg p-2" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-bold tracking-tight mt-0.5" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}