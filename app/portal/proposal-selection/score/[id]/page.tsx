"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, ClipboardCheck, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { InterventionScore, SelectionTool } from "@/types/new/client";
import { DraftScore, groupTools } from "@/types/new/score";
import { getSubmittedProposalById } from "@/app/api/dashboard/submitted-proposals";
import { createInterventionScore, getInterventionScores, getSelectionTools } from "@/app/api/new/client";
import { InterventionDetail } from "./details";
import { ScoringWizard } from "./wizard";

export default function InterventionScoringPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [proposal, setProposal] = useState<SubmittedProposal | null>(null);
  const [tools, setTools] = useState<SelectionTool[]>([]);
  const [savedScores, setSavedScores] = useState<InterventionScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, DraftScore>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, toolList, scoreList] = await Promise.all([
        getSubmittedProposalById(id),
        getSelectionTools(),
        getInterventionScores(id),
      ]);
      setProposal(p);
      setTools(toolList);
      setSavedScores(scoreList);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => groupTools(tools), [tools]);
  const isAlreadyScored = savedScores.length > 0;

  const handleDraftChange = (label: string, draft: DraftScore | null) => {
    setDrafts((prev) => {
      if (!draft) { const next = { ...prev }; delete next[label]; return next; }
      return { ...prev, [label]: draft };
    });
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    try {
      const entries = Object.values(drafts);
      const results = await Promise.all(
        entries.map((d) =>
          createInterventionScore({
            intervention: id,
            criteria: d.tool_id,
            score: {
              tool_id: d.tool_id,
              scoring_mechanism: d.scoring_mechanism,
              score_value: d.score_value,
              criteria_label: d.criteriaGroupLabel,
            },
            comment: d.comment,
          })
        )
      );
      const failed = results.filter((r) => !r).length;
      if (failed === 0) {
        toast.success(`${entries.length} scores submitted.`);
        setDrafts({});
        await load();
      } else {
        toast.error(`${failed} score(s) failed.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Proposal not found.</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5  mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-teal-100 p-1.5 rounded-md">
              {isAlreadyScored
                ? <Eye className="h-4 w-4 text-teal-600" />
                : <ClipboardCheck className="h-4 w-4 text-teal-600" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">
                {isAlreadyScored ? "Scoring Review" : "Selection Scoring"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAlreadyScored
                  ? "Your submitted scores for this intervention"
                  : "Score each criteria using next/prev, then submit all at once"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAlreadyScored ? (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1" variant="outline">
              <ClipboardCheck className="h-3 w-3" /> Scored
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs">
              {Object.keys(drafts).length}/{groups.length} drafted
            </Badge>
          )}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5 items-start">
        <div className="lg:sticky lg:top-4">
          <InterventionDetail proposal={proposal} />
        </div>
        <ScoringWizard
          groups={groups}
          drafts={drafts}
          onDraftChange={handleDraftChange}
          onSubmitAll={handleSubmitAll}
          isSubmitting={submitting}
          readOnly={isAlreadyScored}
          savedScores={savedScores}
        />
      </div>
    </div>
  );
}