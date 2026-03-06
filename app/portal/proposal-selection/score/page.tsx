"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, RefreshCw, ChevronRight, MapPin, Building2, CheckCircle2, Eye } from "lucide-react";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import { getInterventionScores } from "@/app/api/new/client";
import { Column, DataTable } from "../../config/cc/table";

export default function SelectionListPage() {
  const [proposals, setProposals] = useState<SubmittedProposal[]>([]);
  const [scoredIds, setScoredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsRes, scoresRes] = await Promise.all([
        getSubmittedProposals(),
        getInterventionScores(), 
      ]);
      setProposals(proposalsRes.results ?? []);
      // Build a set of intervention IDs the current user has already scored
      const ids = new Set(scoresRes.map((s) => String(s.intervention)));
      setScoredIds(ids);
    } catch {
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<SubmittedProposal>[] = [
    {
      header: "Ref",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-500">{row.reference_number}</span>
      ),
    },
    {
      header: "Intervention",
      cell: (row) => (
        <div className="max-w-xs">
          <p className="font-medium text-slate-800 text-sm leading-snug">
            {row.intervention_name ?? "Untitled"}
          </p>
          {row.intervention_type && (
            <Badge variant="secondary" className="text-xs mt-1">{row.intervention_type}</Badge>
          )}
        </div>
      ),
    },
    {
      header: "Submitter",
      cell: (row) => (
        <div className="text-sm">
          <p className="text-slate-700">{row.name}</p>
          {row.organization && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Building2 className="h-3 w-3" />{row.organization}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "County",
      cell: (row) => row.county ? (
        <span className="flex items-center gap-1 text-sm text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />{row.county}
        </span>
      ) : <span className="text-slate-300">—</span>,
    },
    {
      header: "Date",
      cell: (row) => (
        <span className="text-sm text-slate-500">
          {new Date(row.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const scored = scoredIds.has(String(row.id));
        return scored ? (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1" variant="outline">
            <CheckCircle2 className="h-3 w-3" /> Scored
          </Badge>
        ) : (
          <Badge className="bg-amber-50 text-amber-600 border-amber-200" variant="outline">
            Pending
          </Badge>
        );
      },
    },
    {
      header: "",
      cell: (row) => {
        const scored = scoredIds.has(String(row.id));
        return (
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            variant={scored ? "outline" : "default"}
            onClick={() => router.push(`/portal/proposal-selection/score/${row.id}`)}
          >
            {scored
              ? <><Eye className="h-3.5 w-3.5" /> View</>
              : <> Score <ChevronRight className="h-3.5 w-3.5" /></>
            }
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}



