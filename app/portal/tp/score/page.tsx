"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck, RefreshCw, ChevronRight, CheckCircle2, Eye,
} from "lucide-react";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { SystemCategory } from "@/types/new/client";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import { getInterventionScores, getSystemCategories, getInterventionCategories } from "@/app/api/new/client";
import { Column, DataTable, CategoryFilterOption } from "../../config/cc/table";

export default function SelectionListPage() {
  const [proposals, setProposals] = useState<SubmittedProposal[]>([]);
  const [scoredIds, setScoredIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<SystemCategory[]>([]);
  const [interventionCategoryMap, setInterventionCategoryMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsRes, scoresRes, cats, allLinks] = await Promise.all([
        getSubmittedProposals(),
        getInterventionScores(),
        getSystemCategories(),
        getInterventionCategories(),
      ]);

      setProposals(proposalsRes.results ?? []);
      setScoredIds(new Set(scoresRes.map((s) => String(s.intervention))));
      setCategories(cats);

      const map: Record<string, string[]> = {};
      allLinks.forEach((link) => {
        const key = String(link.intervention);
        map[key] = [...(map[key] ?? []), String(link.system_category)];
      });
      setInterventionCategoryMap(map);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const categoryOptions: CategoryFilterOption[] = categories.map((c) => ({
    id: String(c.id),
    name: c.name,
  }));

  const columns: Column<SubmittedProposal>[] = [
    {
      header: "Ref",
      width: "w-56",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-400 whitespace-nowrap ">
          <button
            onClick={() =>
              router.push(`/portal/interventions/${row.id}`)
            }
            className="font-mono  text-xs bg-slate-100 hover:bg-[#27aae1]/10 hover:text-[#27aae1] px-2 py-1 rounded transition-colors text-[#27aae1] whitespace-nowrap"
          >
            {row.reference_number ?? "—"}
          </button>
        </span>
      ),
    },
    {
      header: "Intervention",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800 text-sm leading-snug line-clamp-2 min-w-[240px]">
            {row.intervention_name ?? "Untitled"}
          </p>
          {/* {row.intervention_type && (
            <Badge variant="secondary" className="text-[10px] mt-1 font-normal h-4 px-1.5">
              {row.intervention_type}
            </Badge>
          )} */}
        </div>
      ),
    },
    {
      header: "Categories",
      width: "w-52",
      cell: (row) => {
        const catIds = interventionCategoryMap[String(row.id)] ?? [];
        const matched = categories.filter((c) => catIds.includes(String(c.id)));
        if (!matched.length) return <span className="text-slate-300 text-xs">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {matched.map((c) => (
              <Badge
                key={c.id}
                variant="outline"
                className="text-[10px] font-normal px-1.5 h-8 text-slate-600 border-slate-200 whitespace-nowrap"
              >
                {c.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      header: "Date",
      width: "w-24",
      cell: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {new Date(row.date).toLocaleDateString("en-GB")}
        </span>
      ),
    },
    {
      header: "Status",
      width: "w-24",
      cell: (row) => {
        const scored = scoredIds.has(String(row.id));
        return scored ? (
          <Badge
            className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[11px] font-normal whitespace-nowrap"
            variant="outline"
          >
            <CheckCircle2 className="h-3 w-3" /> Scored
          </Badge>
        ) : (
          <Badge
            className="bg-amber-50 text-amber-600 border-amber-200 text-[11px] font-normal whitespace-nowrap"
            variant="outline"
          >
            Pending
          </Badge>
        );
      },
    },
    {
      header: "",
      width: "w-20",
      cell: (row) => {
        const scored = scoredIds.has(String(row.id));
        return (
          <Button
            size="sm"
            className="h-7 text-xs gap-1 whitespace-nowrap"
            variant={scored ? "outline" : "default"}
            onClick={() => router.push(`/portal/tp/score/${row.id}`)}
          >
            {scored
              ? <><Eye className="h-3 w-3" /> View</>
              : <>Score <ChevronRight className="h-3 w-3" /></>
            }
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
            <ClipboardCheck className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Intervention Selection</h1>
            <p className="text-sm text-slate-500">
              Select a proposal to score against the selection criteria
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-800">Submitted Proposals</CardTitle>
              <CardDescription>
                {proposals.length} proposals · {scoredIds.size} already scored by you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : (
            <DataTable
              data={proposals}
              columns={columns}
              searchPlaceholder="Search by name, reference, category..."
              searchFn={(row, q) =>
                [row.intervention_name, row.reference_number]
                  .filter(Boolean)
                  .some((v) => v!.toLowerCase().includes(q))
              }
              categories={categoryOptions}
              categoryFilterFn={(row, categoryId) =>
                (interventionCategoryMap[String(row.id)] ?? []).includes(categoryId)
              }
              dateFilterFn={(row, from, to) => {
                const d = new Date(row.date).getTime();
                const f = from ? new Date(from).getTime() : null;
                const t = to ? new Date(to).getTime() : null;
                return (!f || d >= f) && (!t || d <= t);
              }}
              sortFns={{
                latest: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                az: (a, b) => (a.intervention_name ?? "").localeCompare(b.intervention_name ?? ""),
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}