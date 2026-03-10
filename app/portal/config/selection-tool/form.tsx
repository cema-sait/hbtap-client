"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronsUpDown, Check, RotateCcw } from "lucide-react";
import { SelectionTool } from "@/types/new/client";

import { cn } from "@/lib/utils";
import { getSelectionTools } from "@/app/api/new/client";

type FormState = {
  criteria: string;
  description: string;
  scoring_mechanism: string;
  score: string;
};

const empty: FormState = { criteria: "", description: "", scoring_mechanism: "", score: "" };

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<SelectionTool>) => Promise<void>;
  defaultValues?: Partial<SelectionTool>;
  isSubmitting: boolean;
}

export function SelectionToolForm({ open, onClose, onSubmit, defaultValues, isSubmitting }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isEdit = !!defaultValues?.id;

  // Autocomplete state
  const [existingTools, setExistingTools] = useState<SelectionTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [reusedFrom, setReusedFrom] = useState<SelectionTool | null>(null);
  const criteriaRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch existing tools once when form opens
  useEffect(() => {
    if (open && existingTools.length === 0) {
      setLoadingTools(true);
      getSelectionTools()
        .then(setExistingTools)
        .finally(() => setLoadingTools(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setReusedFrom(null);
      setForm({
        criteria: defaultValues?.criteria ?? "",
        description: defaultValues?.description ?? "",
        scoring_mechanism: defaultValues?.scoring_mechanism ?? "",
        score: defaultValues?.scores != null ? String(defaultValues.scores) : "",
      });
    }
  }, [open, defaultValues]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        criteriaRef.current && !criteriaRef.current.contains(e.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = form.criteria.trim().toLowerCase();
  const filteredSuggestions = !q
    ? existingTools.slice(0, 6)
    : existingTools.filter((t) => t.criteria.toLowerCase().includes(q)).slice(0, 6);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (field === "criteria") {
        setReusedFrom(null);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      }
    };

  const reuseTool = (tool: SelectionTool) => {
    setForm({
      criteria: tool.criteria,
      description: tool.description,
      scoring_mechanism: tool.scoring_mechanism ?? "",
      score: tool.scores != null ? String(tool.scores) : "",
    });
    setReusedFrom(tool);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const resetForm = () => {
    setForm(empty);
    setReusedFrom(null);
  };

  const handleCriteriaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const suggestions = filteredSuggestions;
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      reuseTool(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.criteria.trim()) e.criteria = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (form.score !== "" && isNaN(Number(form.score))) e.score = "Must be a number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      criteria: form.criteria.trim(),
      description: form.description.trim(),
      scoring_mechanism: form.scoring_mechanism.trim() || null,
      scores: form.score !== "" ? Number(form.score) : null,
    });
  };

  const suggestions = filteredSuggestions;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto px-0 lg:px-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit" : "New"} topic selection tool</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update criteria and scoring details." : "Type a criteria or reuse an existing one."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">

          {/* Criteria with autocomplete */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>
                Criteria <span className="text-destructive">*</span>
              </Label>
              {reusedFrom && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear reused
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                ref={criteriaRef}
                value={form.criteria}
                onChange={set("criteria")}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleCriteriaKeyDown}
                placeholder="e.g. Disease Burden"
                autoComplete="off"
                className={cn(reusedFrom && "border-primary/50 bg-primary/5")}
              />

              {/* Loading spinner inside input */}
              {loadingTools && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && !loadingTools && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden"
                >
                  <div className="px-2 pt-2 pb-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                      Existing criteria
                    </p>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {suggestions.map((tool, i) => (
                      <button
                        key={tool.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); reuseTool(tool); }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors",
                          highlightedIndex === i ? "bg-accent" : "hover:bg-accent/60"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{tool.criteria}</span>
                            {tool.scores != null && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                                {tool.scores}
                              </Badge>
                            )}
                          </div>
                          {tool.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {tool.description}
                            </p>
                          )}
                        </div>
                        {form.criteria.trim().toLowerCase() === tool.criteria.toLowerCase() && (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reused banner */}
            {reusedFrom && (
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <ChevronsUpDown className="h-3 w-3" />
                <span>Reusing <strong>{reusedFrom.criteria}</strong> — you can edit fields below</span>
              </div>
            )}

            {errors.criteria && <p className="text-xs text-destructive">{errors.criteria}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Describe what this criteria measures..."
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          {/* Scoring Mechanism */}
          <div className="space-y-1.5">
            <Label>Scoring Mechanism</Label>
            <Textarea
              value={form.scoring_mechanism}
              onChange={set("scoring_mechanism")}
              rows={3}
              placeholder="How are scores assigned?"
            />
          </div>

          <Separator />

          {/* Score */}
          <div className="space-y-1.5">
            <Label>Score</Label>
            <Input
              type="number"
              value={form.score}
              onChange={set("score")}
              placeholder="e.g. 3"
              max={3}
            />
            {errors.score && <p className="text-xs text-destructive">{errors.score}</p>}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create new"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}