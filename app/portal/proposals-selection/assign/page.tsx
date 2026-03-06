"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  RefreshCw, Link2, Search, ChevronDown, X, CheckCircle2, Circle, Check,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

import { SubmittedProposal } from "@/types/dashboard/submittedProposals";
import { SystemCategory, InterventionSystemCategory } from "@/types/new/client";
import { getSubmittedProposals } from "@/app/api/dashboard/submitted-proposals";
import {
  getSystemCategories,
  getInterventionCategories,
  createInterventionCategory,
  deleteInterventionCategory,
} from "@/app/api/new/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InterventionRow {
  proposal: SubmittedProposal;
  linkedCategories: InterventionSystemCategory[];
  saving: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssignCategoriesPage() {
  const [rows, setRows] = useState<InterventionRow[]>([]);
  const [allCategories, setAllCategories] = useState<SystemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsRes, categories, allLinks] = await Promise.all([
        getSubmittedProposals(),
        getSystemCategories(),
        getInterventionCategories(),
      ]);

      const proposals = proposalsRes.results ?? [];
      setAllCategories(categories);

      const linksByIntervention = allLinks.reduce<Record<string, InterventionSystemCategory[]>>(
        (acc, link) => {
          const key = String(link.intervention);
          acc[key] = [...(acc[key] ?? []), link];
          return acc;
        },
        {}
      );

      setRows(
        proposals.map((p) => ({
          proposal: p,
          linkedCategories: linksByIntervention[String(p.id)] ?? [],
          saving: false,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Assign a category to an intervention ──────────────────────────────────
  const assignCategory = async (interventionId: string, categoryId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        String(r.proposal.id) === interventionId ? { ...r, saving: true } : r
      )
    );

    const result = await createInterventionCategory({
      intervention: interventionId as any,
      system_category: categoryId as any,
    });

    if (result) {
      toast.success("Category linked.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId
            ? { ...r, saving: false, linkedCategories: [...r.linkedCategories, result] }
            : r
        )
      );
    } else {
      toast.error("Failed to link category.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId ? { ...r, saving: false } : r
        )
      );
    }
  };

  // ── Remove a category link ─────────────────────────────────────────────────
  const removeCategory = async (interventionId: string, linkId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        String(r.proposal.id) === interventionId ? { ...r, saving: true } : r
      )
    );

    const ok = await deleteInterventionCategory(linkId);
    if (ok) {
      toast.success("Category removed.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId
            ? {
                ...r,
                saving: false,
                linkedCategories: r.linkedCategories.filter((l) => l.id !== linkId),
              }
            : r
        )
      );
    } else {
      toast.error("Failed to remove category.");
      setRows((prev) =>
        prev.map((r) =>
          String(r.proposal.id) === interventionId ? { ...r, saving: false } : r
        )
      );
    }
  };

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.proposal.intervention_name?.toLowerCase().includes(q) ||
      r.proposal.reference_number?.toLowerCase().includes(q) ||
      r.linkedCategories.some((l) =>
        allCategories
          .find((c) => c.id === String(l.system_category))
          ?.name.toLowerCase()
          .includes(q)
      )
    );
  });

  const totalLinked = rows.filter((r) => r.linkedCategories.length > 0).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2 rounded-lg border border-teal-100">
            <Link2 className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Assign System Categories</h1>
            <p className="text-sm text-slate-500">
              Link each intervention to one or more system categories
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
        <span className="text-slate-600">
          <strong className="text-slate-800">{rows.length}</strong> interventions total
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">
          <strong className="text-teal-600">{totalLinked}</strong> categorised
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">
          <strong className="text-amber-500">{rows.length - totalLinked}</strong> pending
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search interventions or categories..."
          className="pl-9 bg-white"
        />
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-800">Interventions</CardTitle>
          <CardDescription>{filtered.length} shown</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No interventions found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <InterventionCategoryRow
                  key={row.proposal.id}
                  row={row}
                  allCategories={allCategories}
                  onAssign={assignCategory}
                  onRemove={removeCategory}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Row Component ─────────────────────────────────────────────────────────────
function InterventionCategoryRow({
  row,
  allCategories,
  onAssign,
  onRemove,
}: {
  row: InterventionRow;
  allCategories: SystemCategory[];
  onAssign: (interventionId: string, categoryId: string) => void;
  onRemove: (interventionId: string, linkId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const linkedCategoryIds = new Set(row.linkedCategories.map((l) => String(l.system_category)));
  const interventionId = String(row.proposal.id);
  const isLinked = row.linkedCategories.length > 0;

  const toggleCategory = (categoryId: string) => {
    const existingLink = row.linkedCategories.find(
      (l) => String(l.system_category) === categoryId
    );
    if (existingLink) {
      onRemove(interventionId, existingLink.id);
    } else {
      onAssign(interventionId, categoryId);
    }
  };

  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
      {/* Status dot */}
      <div className="pt-1 shrink-0">
        {isLinked ? (
          <CheckCircle2 className="h-4 w-4 text-teal-500" />
        ) : (
          <Circle className="h-4 w-4 text-slate-300" />
        )}
      </div>

      {/* Intervention info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">{row.proposal.reference_number}</span>
          <span className="font-medium text-sm text-slate-800 truncate">
            {row.proposal.intervention_name ?? "Untitled"}
          </span>
          {row.proposal.intervention_type && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {row.proposal.intervention_type}
            </Badge>
          )}
        </div>

        {/* Linked category badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {row.linkedCategories.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No categories assigned</span>
          ) : (
            row.linkedCategories.map((link) => {
              const cat = allCategories.find((c) => c.id === String(link.system_category));
              return (
                <Badge
                  key={link.id}
                  variant="outline"
                  className="text-xs gap-1 bg-teal-50 text-teal-700 border-teal-200 pr-1"
                >
                  {cat?.name ?? "Unknown"}
                  <button
                    onClick={() => onRemove(interventionId, link.id)}
                    disabled={row.saving}
                    className="hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })
          )}
        </div>
      </div>

      {/* Category picker */}
      <div className="shrink-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={row.saving}
              className="h-8 text-xs gap-1.5 text-slate-600"
            >
              {row.saving ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              Assign
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search categories..." className="h-9" />
              <CommandList>
                <CommandEmpty>No categories found.</CommandEmpty>
                <CommandGroup>
                  {allCategories.map((cat) => {
                    const selected = linkedCategoryIds.has(cat.id);
                    return (
                      <CommandItem
                        key={cat.id}
                        value={cat.name}
                        onSelect={() => toggleCategory(cat.id)}
                        className="flex items-start gap-2 py-2"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4 mt-0.5 shrink-0",
                            selected ? "text-teal-600 opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", selected && "text-teal-700")}>
                            {cat.name}
                          </p>
                          {cat.description && (
                            <p className="text-xs text-slate-400 truncate">{cat.description}</p>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}