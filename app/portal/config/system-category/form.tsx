"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronsUpDown, RotateCcw } from "lucide-react";
import { SystemCategory } from "@/types/new/client";

import { cn } from "@/lib/utils";
import { getSystemCategories } from "@/app/api/new/client";

type FormState = { name: string; description: string };
const empty: FormState = { name: "", description: "" };

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<SystemCategory>) => Promise<void>;
  defaultValues?: Partial<SystemCategory>;
  isSubmitting: boolean;
}

export function SystemCategoryForm({ open, onClose, onSubmit, defaultValues, isSubmitting }: Props) {
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const isEdit = !!defaultValues?.id;

  const [existingCategories, setExistingCategories] = useState<SystemCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [reusedFrom, setReusedFrom] = useState<SystemCategory | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && existingCategories.length === 0) {
      setLoadingCategories(true);
      getSystemCategories()
        .then(setExistingCategories)
        .finally(() => setLoadingCategories(false));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setReusedFrom(null);
      setForm({
        name: defaultValues?.name ?? "",
        description: defaultValues?.description ?? "",
      });
    }
  }, [open, defaultValues]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const q = form.name.trim().toLowerCase();
  const filteredSuggestions = !q
    ? existingCategories.slice(0, 6)
    : existingCategories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (field === "name") {
        setReusedFrom(null);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
      }
    };

  const reuseCategory = (cat: SystemCategory) => {
    setForm({ name: cat.name, description: cat.description });
    setReusedFrom(cat);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && highlightedIndex >= 0) { e.preventDefault(); reuseCategory(filteredSuggestions[highlightedIndex]); }
    else if (e.key === "Escape") setShowSuggestions(false);
  };

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: form.name.trim(), description: form.description.trim() });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-md px-1 lg:px-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit" : "New"} System Category</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update category details." : "Type a category name or reuse an existing one."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Category Name <span className="text-destructive">*</span></Label>
              {reusedFrom && (
                <button
                  type="button"
                  onClick={() => { setForm(empty); setReusedFrom(null); }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear reused
                </button>
              )}
            </div>

            <div className="relative">
              <Input
                ref={inputRef}
                value={form.name}
                onChange={set("name")}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Maternal & Child Health"
                autoComplete="off"
                className={cn(reusedFrom && "border-primary/50 bg-primary/5")}
              />

              {loadingCategories && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              )}

              {showSuggestions && !loadingCategories && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 top-full mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden"
                >
                  <div className="px-2 pt-2 pb-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                      Existing categories
                    </p>
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {filteredSuggestions.map((cat, i) => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); reuseCategory(cat); }}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 flex flex-col gap-0.5 transition-colors",
                          highlightedIndex === i ? "bg-accent" : "hover:bg-accent/60"
                        )}
                      >
                        <span className="text-sm font-medium truncate">{cat.name}</span>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {reusedFrom && (
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <ChevronsUpDown className="h-3 w-3" />
                <span>Reusing <strong>{reusedFrom.name}</strong> — you can edit fields below</span>
              </div>
            )}

            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={4}
              placeholder="Describe what interventions fall under this category..."
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}