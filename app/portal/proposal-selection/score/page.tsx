"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck, RefreshCw, ChevronRight, MapPin, Building2, CheckCircle2, Eye,
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
  // Map: intervention id → category ids
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

      // Build map: intervention id → [category ids]
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
    id: c.id,
    name: c.name,
  }));

  const columns: Column<SubmittedProposal>[] = [
    {
      header: "Ref",
      width: "w-28",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-400 whitespace-nowrap">{row.reference_number}</span>
      ),
    },
    {
      header: "Intervention",
      // no fixed width — takes remaining space, truncates
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800 text-sm leading-snug truncate">
            {row.intervention_name ?? "Untitled"}
          </p>
          {row.intervention_type && (
            <Badge variant="secondary" className="text-[10px] mt-1 font-normal h-4 px-1.5">
              {row.intervention_type}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Submitter",
      width: "w-44",
      cell: (row) => (
        <div className="text-sm">
          <p className="text-slate-700 truncate">{row.name}</p>
          {row.organization && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{row.organization}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      header: "County",
      width: "w-28",
      cell: (row) => row.county ? (
        <span className="flex items-center gap-1 text-sm text-slate-600 whitespace-nowrap">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{row.county}</span>
        </span>
      ) : <span className="text-slate-300">—</span>,
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
            onClick={() => router.push(`/portal/proposal-selection/score/${row.id}`)}
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
              searchPlaceholder="Search by name, county, organisation..."
              searchFn={(row, q) =>
                [row.intervention_name, row.name, row.county, row.organization, row.reference_number]
                  .filter(Boolean)
                  .some((v) => v!.toLowerCase().includes(q))
              }
              categories={categoryOptions}
              categoryFilterFn={(row, categoryId) =>
                (interventionCategoryMap[String(row.id)] ?? []).includes(categoryId)
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}