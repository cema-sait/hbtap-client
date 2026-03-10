"use client";

import { useState, useMemo } from "react";
import type { InterventionScore } from "@/types/new/client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, ChevronLeft, ChevronRight, CheckCircle2, Circle,
  TrendingUp, Send, Loader2,
} from "lucide-react";
import { CriteriaGroup, DraftScore } from "@/types/new/score";

interface Props {
  groups: CriteriaGroup[];
  drafts: Record<string, DraftScore>;    
  onDraftChange: (label: string, draft: DraftScore | null) => void;
  onSubmitAll: () => Promise<void>;
  isSubmitting: boolean;
  // Read-only mode (already scored)
  readOnly?: boolean;
  savedScores?: InterventionScore[];
}

function ScoreBadge({ value }: { value: number }) {
  return (
    <Badge variant="outline" className={`font-bold tabular-nums text-xs ${
      value >= 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : value === 2 ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200"
    }`}>
      {value} pt{value !== 1 ? "s" : ""}
    </Badge>
  );
}

export function ScoringWizard({
  groups, drafts, onDraftChange, onSubmitAll, isSubmitting, readOnly = false, savedScores = [],
}: Props) {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [comment, setComment] = useState(drafts[groups[step]?.criteria]?.comment ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Filter groups by search
  const filtered = useMemo(() =>
    query
      ? groups.filter((g) =>
          g.criteria.toLowerCase().includes(query.toLowerCase()) ||
          g.description.toLowerCase().includes(query.toLowerCase())
        )
      : groups,
    [groups, query]
  );

  // Clamp step when filter changes
  const clampedStep = Math.min(step, Math.max(0, filtered.length - 1));
  const current = filtered[clampedStep];

  const currentDraft = current ? drafts[current.criteria] : undefined;

  // Totals
  const totalScore = useMemo(
    () => Object.values(drafts).reduce((s, d) => s + (d?.score_value ?? 0), 0),
    [drafts]
  );
  const maxScore = useMemo(
    () => groups.reduce((s, g) => s + Math.max(...g.options.map((o) => Number(o.scores) || 0)), 0),
    [groups]
  );
  const draftedCount = Object.keys(drafts).length;
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const allScored = draftedCount === groups.length;

  // For read-only: map tool_id → saved score
  const savedByToolId = useMemo(() => {
    const map = new Map<string, InterventionScore>();
    for (const s of savedScores) {
      const tid = (s.score as Record<string, unknown>)?.tool_id as string;
      if (tid) map.set(tid, s);
    }
    return map;
  }, [savedScores]);

  const getSavedForGroup = (g: CriteriaGroup) =>
    g.options.map((o) => savedByToolId.get(o.id)).find(Boolean);

  const selectOption = (group: CriteriaGroup, toolId: string) => {
    if (readOnly) return;
    const opt = group.options.find((o) => o.id === toolId)!;
    const existing = drafts[group.criteria];
    const newDraft: DraftScore = {
      criteriaGroupLabel: group.criteria,
      tool_id: toolId,
      scoring_mechanism: opt.scoring_mechanism ?? "",
      score_value: Number(opt.scores),
      comment: existing?.comment ?? comment,
    };
    onDraftChange(group.criteria, newDraft);
  };

  const saveComment = () => {
    if (!current || !currentDraft) return;
    onDraftChange(current.criteria, { ...currentDraft, comment });
  };

  const goNext = () => {
    saveComment();
    if (clampedStep < filtered.length - 1) {
      const next = filtered[clampedStep + 1];
      setComment(drafts[next.criteria]?.comment ?? "");
      setStep(clampedStep + 1);
    }
  };

  const goPrev = () => {
    saveComment();
    if (clampedStep > 0) {
      const prev = filtered[clampedStep - 1];
      setComment(drafts[prev.criteria]?.comment ?? "");
      setStep(clampedStep - 1);
    }
  };

  const jumpTo = (idx: number) => {
    saveComment();
    const target = filtered[idx];
    setComment(drafts[target?.criteria]?.comment ?? "");
    setStep(idx);
  };

  if (!current) return (
    <Card className="border-slate-200">
      <CardContent className="py-16 text-center text-slate-400 text-sm">No criteria match your search.</CardContent>
    </Card>
  );

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        {/* Header */}
        <CardHeader className="px-5 pt-5 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {readOnly ? "Scoring Review" : "Score Criteria"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {readOnly ? `${savedScores.length} criteria scored` : `${draftedCount} of ${groups.length} drafted`}
              </p>
            </div>
            {/* Totals */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-teal-600 font-semibold">Score</p>
                <p className="text-2xl font-bold text-slate-800 tabular-nums leading-none mt-0.5">
                  {readOnly
                    ? savedScores.reduce((s, sc) => s + (Number((sc.score as Record<string, unknown>)?.score_value) || 0), 0)
                    : totalScore
                  }
                  <span className="text-sm font-normal text-slate-400">/{maxScore}</span>
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                pct >= 70 ? "border-emerald-400 text-emerald-600 bg-emerald-50"
                : pct >= 40 ? "border-amber-400 text-amber-600 bg-amber-50"
                : draftedCount === 0 ? "border-slate-200 text-slate-400 bg-slate-50"
                : "border-red-400 text-red-600 bg-red-50"
              }`}>{pct}%</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400"}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {filtered.map((g, i) => {
              const isDrafted = readOnly ? !!getSavedForGroup(g) : !!drafts[g.criteria];
              const isActive = i === clampedStep;
              return (
                <button
                  key={i}
                  onClick={() => jumpTo(i)}
                  title={g.criteria}
                  className={`rounded-full transition-all ${
                    isActive ? "w-6 h-2.5 bg-teal-500"
                    : isDrafted ? "w-2.5 h-2.5 bg-teal-300"
                    : "w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                />
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search criteria..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setStep(0); }}
              className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5 space-y-4">
          {/* Current criteria */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                {clampedStep + 1} / {filtered.length}
              </Badge>
              {currentDraft && !readOnly && (
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-xs gap-1" variant="outline">
                  <CheckCircle2 className="h-3 w-3" /> Drafted
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-semibold text-slate-800 leading-snug">{current.criteria}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{current.description}</p>
          </div>

          <Separator className="bg-slate-100" />

          {/* Options */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
              {readOnly ? "Selected Option" : "Select one option"}
            </p>
            {[...current.options]
              .sort((a, b) => Number(b.scores) - Number(a.scores))
              .map((opt) => {
                const val = Number(opt.scores);
                // Active state: draft (scoring mode) or saved (read-only)
                const isSelected = readOnly
                  ? !!savedByToolId.get(opt.id)
                  : currentDraft?.tool_id === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={readOnly}
                    onClick={() => selectOption(current, opt.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                        : readOnly
                        ? "border-slate-100 bg-slate-50 cursor-default"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                          isSelected ? "border-teal-500" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="h-2 w-2 rounded-full bg-teal-500" />}
                        </div>
                        <span className="text-sm text-slate-700 leading-snug">{opt.scoring_mechanism}</span>
                      </div>
                      <ScoreBadge value={val} />
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
              Notes <span className="text-slate-400 normal-case font-normal tracking-normal">(optional)</span>
            </p>
            {readOnly ? (
              (() => {
                const saved = getSavedForGroup(current);
                return saved?.comment
                  ? <p className="text-sm text-slate-600 italic bg-slate-50 border border-slate-200 rounded-md px-3 py-2">"{saved.comment}"</p>
                  : <p className="text-xs text-slate-400">No notes added.</p>;
              })()
            ) : (
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add context or justification..."
                rows={2}
                className="resize-none text-sm"
              />
            )}
          </div>

          <Separator className="bg-slate-100" />

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline" size="sm"
              onClick={goPrev}
              disabled={clampedStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>

            <div className="flex items-center gap-2">
              {!readOnly && clampedStep === filtered.length - 1 && allScored ? (
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Submitting...</>
                    : <><Send className="h-3.5 w-3.5" />Submit All</>
                  }
                </Button>
              ) : !readOnly && allScored ? (
                <Button
                  size="sm" variant="outline"
                  className="border-teal-300 text-teal-700 gap-1"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isSubmitting}
                >
                  <Send className="h-3.5 w-3.5" /> Submit All ({draftedCount})
                </Button>
              ) : null}

              {clampedStep < filtered.length - 1 && (
                <Button
                  variant="outline" size="sm"
                  onClick={goNext}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Draft summary */}
          {!readOnly && draftedCount > 0 && (
            <>
              <Separator className="bg-slate-100" />
              <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Running Total</span>
                  <span className="text-xs text-slate-500">({draftedCount}/{groups.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white tabular-nums">
                    {totalScore}<span className="text-xs font-normal text-slate-400">/{maxScore}</span>
                  </span>
                  <Badge className={`font-bold text-xs border-0 ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"} text-white`}>
                    {pct}%
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm submit */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit all scores?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <span className="block">You are about to submit <strong>{draftedCount} scores</strong> for this intervention.</span>
              <span className="block bg-slate-50 border rounded-md px-3 py-2 text-slate-700">
                Total: <strong>{totalScore}/{maxScore}</strong> · <strong>{pct}%</strong>
              </span>
              <span className="block text-slate-400 text-xs">Scores cannot be changed after submission.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={async () => { setConfirmOpen(false); await onSubmitAll(); }}
            >
              Yes, Submit All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}