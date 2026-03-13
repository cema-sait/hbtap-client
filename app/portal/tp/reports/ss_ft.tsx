"use client";


import { Search, SlidersHorizontal, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SystemCategory } from "@/types/new/client";

export interface ReviewerOption { id: string; label: string }
export interface InterventionOption { id: string; label: string }

export interface ScoreListFiltersProps {
  searchText: string;
  onSearchChange: (v: string) => void;

  filterIntervention: string;
  onInterventionChange: (v: string) => void;
  interventionOptions: InterventionOption[];

  filterReviewer: string;
  onReviewerChange: (v: string) => void;
  reviewerOptions: ReviewerOption[];

  filterCategory: string;
  onCategoryChange: (v: string) => void;
  categoryOptions: SystemCategory[];

  showAll: boolean;
  onShowAllChange: (v: boolean) => void;

  pageSize: number;
  onPageSizeChange: (v: number) => void;

  shownCount: number;
  totalCount: number;
  filteredCount: number;
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100];


export function ScoreListFilters({
  searchText, onSearchChange,
  filterIntervention, onInterventionChange, interventionOptions,
  filterReviewer, onReviewerChange, reviewerOptions,
  filterCategory, onCategoryChange, categoryOptions,
  showAll, onShowAllChange,
  pageSize, onPageSizeChange,
  shownCount, totalCount, filteredCount,
}: ScoreListFiltersProps) {
  return (
    <div className="space-y-2.5">
      {/* Row 1 – search + dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Free-text search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search criteria, intervention…"
            className="pl-9 h-9 text-sm bg-white border-slate-200"
          />
        </div>

        {/* Intervention filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <Select value={filterIntervention} onValueChange={onInterventionChange}>
            <SelectTrigger className="h-9 w-56 text-sm bg-white border-slate-200 truncate">
              <SelectValue placeholder="All interventions" />
            </SelectTrigger>
            <SelectContent className="max-w-xs">
              <SelectItem value="all">All interventions</SelectItem>
              {interventionOptions.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  <span className="truncate max-w-[220px] block text-xs">{label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reviewer filter */}
        <Select value={filterReviewer} onValueChange={onReviewerChange}>
          <SelectTrigger className="h-9 w-44 text-sm bg-white border-slate-200">
            <SelectValue placeholder="All reviewers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reviewers</SelectItem>
            {reviewerOptions.map(({ id, label }) => (
              <SelectItem key={id} value={id}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {categoryOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <Select value={filterCategory || "__all__"} onValueChange={(v) => onCategoryChange(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-9 w-56 text-sm bg-white border-slate-200 truncate">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="max-w-xs">
                <SelectItem value="__all__">All system categories</SelectItem>
                {categoryOptions.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="whitespace-normal text-xs leading-snug py-2">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page size – right-aligned */}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-slate-500">
          <span className="whitespace-nowrap">Rows</span>
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-9 w-20 text-xs bg-white border-slate-200">
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

      {/* Row 2 – show-all toggle + result count */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch
            id="show-all-toggle"
            checked={showAll}
            onCheckedChange={onShowAllChange}
          />
          <Label htmlFor="show-all-toggle" className="text-xs text-slate-600 cursor-pointer select-none">
            Show all interventions (including unscored)
          </Label>
        </div>

        <p className="text-xs text-slate-500 ml-auto">
          <strong className="text-slate-700">{filteredCount}</strong> score{filteredCount !== 1 ? "s" : ""}
          {filteredCount !== totalCount && (
            <span className="text-slate-400"> (filtered from {totalCount})</span>
          )}
          {" · "}showing <strong className="text-slate-700">{shownCount}</strong> on this page
        </p>
      </div>
    </div>
  );
}