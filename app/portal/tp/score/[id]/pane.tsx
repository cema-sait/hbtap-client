"use client";

import { useState, useMemo } from "react";
import type { InterventionScore } from "@/types/new/client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, CheckCircle2, Circle, ChevronRight, TrendingUp } from "lucide-react";
import { CriteriaGroup } from "./dialogue";

interface Props {
  groups: CriteriaGroup[];
  scores: InterventionScore[];
  onScore: (group: CriteriaGroup) => void;
}

export function ScoringPanel({ groups, scores, onScore }: Props) {
  const [query, setQuery] = useState("");


  const savedByToolId = useMemo(() => {
    const map = new Map<string, InterventionScore>();
    for (const s of scores) {
      const toolId = (s.score as Record<string, unknown>)?.tool_id as string;
      if (toolId) map.set(toolId, s);
    }
    return map;
  }, [scores]);

  const isScoredGroup = (group: CriteriaGroup) =>
    group.options.some((o) => savedByToolId.has(o.id));

  const getSavedScore = (group: CriteriaGroup): InterventionScore | undefined =>
    group.options.map((o) => savedByToolId.get(o.id)).find(Boolean);

  const filtered = useMemo(
    () => query
      ? groups.filter((g) =>
          g.criteria.toLowerCase().includes(query.toLowerCase()) ||
          g.description.toLowerCase().includes(query.toLowerCase())
        )
      : groups,
    [groups, query]
  );

  const totalScore = useMemo(
    () => scores.reduce((sum, s) => sum + (Number((s.score as Record<string, unknown>)?.score_value) || 0), 0),
    [scores]
  );

  const maxScore = useMemo(
    () => groups.reduce((sum, g) => sum + Math.max(...g.options.map((o) => Number(o.scores) || 0)), 0),
    [groups]
  );

  const scoredCount = useMemo(() => groups.filter(isScoredGroup).length, [groups, savedByToolId]);
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-0 px-5 pt-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Scoring Criteria</h3>
            <p className="text-xs text-slate-500 mt-0.5">{scoredCount} of {groups.length} criteria scored</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest text-teal-600 font-semibold">Total Score</p>
              <p className="text-2xl font-bold text-slate-800 tabular-nums leading-none mt-0.5">
                {totalScore}<span className="text-sm font-normal text-slate-400">/{maxScore}</span>
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
              pct >= 70 ? "border-emerald-400 text-emerald-600 bg-emerald-50"
              : pct >= 40 ? "border-amber-400 text-amber-600 bg-amber-50"
              : scoredCount === 0 ? "border-slate-200 text-slate-400 bg-slate-50"
              : "border-red-400 text-red-600 bg-red-50"
            }`}>
              {pct}%
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-4 pb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search criteria..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>

        <Separator className="bg-slate-100" />

        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No criteria match your search.</p>
          )}

          {filtered.map((group) => {
            const saved = getSavedScore(group);
            const scored = !!saved;
            const mechanism = scored ? (saved!.score as Record<string, unknown>)?.scoring_mechanism as string : null;
            const scoreVal = scored ? (saved!.score as Record<string, unknown>)?.score_value : null;

            return (
              <div
                key={group.criteria}
                className={`rounded-lg border px-4 py-3 transition-colors ${
                  scored ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {scored
                      ? <CheckCircle2 className="h-4 w-4 text-teal-500" />
                      : <Circle className="h-4 w-4 text-slate-300" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug">{group.criteria}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{group.description}</p>
                    {scored && mechanism && (
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs border-teal-200 text-teal-700 bg-teal-50">
                          {mechanism}
                        </Badge>
                        {saved?.comment && (
                          <span className="text-xs text-slate-400 italic truncate max-w-[200px]">
                            "{saved.comment}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {scored && scoreVal != null && (
                      <Badge
                        variant="outline"
                        className={`font-bold tabular-nums ${
                          Number(scoreVal) >= 3 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : Number(scoreVal) === 2 ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {scoreVal as number} pt{Number(scoreVal) !== 1 ? "s" : ""}
                      </Badge>
                    )}

                    {!scored && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-slate-300 hover:border-teal-400 hover:text-teal-600"
                        onClick={() => onScore(group)}
                      >
                        Score <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {scoredCount > 0 && (
          <>
            <Separator className="bg-slate-100" />
            <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-slate-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Total Score</span>
                <span className="text-xs text-slate-500">({scoredCount}/{groups.length} criteria)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-white tabular-nums">
                  {totalScore}<span className="text-sm font-normal text-slate-400">/{maxScore}</span>
                </span>
                <Badge className={`font-bold ${
                  pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500"
                } text-white border-0`}>
                  {pct}%
                </Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}