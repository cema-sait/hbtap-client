"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, SlidersHorizontal, RefreshCw, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { SelectionTool } from "@/types/new/client";
import { createSelectionTool, deleteSelectionTool, getSelectionTools, updateSelectionTool } from "@/app/api/new/client";
import { Column, DataTable } from "../cc/table";
import { SelectionToolForm } from "./form";

export default function SelectionToolsPage() {
  const [tools, setTools] = useState<SelectionTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<SelectionTool | undefined>();
  const [toDelete, setToDelete] = useState<SelectionTool | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setTools(await getSelectionTools());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (tool: SelectionTool) => { setSelected(tool); setFormOpen(true); };
  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelected(undefined); };

  const handleSubmit = async (values: Partial<SelectionTool>) => {
    setSubmitting(true);
    const result = selected?.id
      ? await updateSelectionTool(selected.id, values)
      : await createSelectionTool(values);
    if (result) {
      toast.success(selected?.id ? "Tool updated." : "Tool created.");
      closeForm();
      await load();
    } else {
      toast.error("Something went wrong.");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const ok = await deleteSelectionTool(toDelete.id);
    if (ok) {
      toast.success("Tool deleted.");
      setTools((prev) => prev.filter((t) => t.id !== toDelete.id));
    } else {
      toast.error("Failed to delete.");
    }
    setToDelete(null);
  };

  const scoreVariant = (s: number | null) =>
    s == null ? "outline" : s >= 7 ? "destructive" : s >= 4 ? "secondary" : "outline";

  const columns: Column<SelectionTool>[] = [
    {
      header: "Criteria",
      cell: (row) => <span className="font-medium">{row.criteria}</span>,
    },
    {
      header: "Description",
      cell: (row) => <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{row.description}</span>,
    },
    {
      header: "Score",
      cell: (row) => row.scores != null
        ? <Badge variant={scoreVariant(row.scores)}>{row.scores}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },

    {
      header: "Created",
      cell: (row) => <span className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row)}><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(row)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Topic Selection Tool</h1>
            <p className="text-sm text-muted-foreground">Criteria for evaluating intervention proposals</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add New..</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Criteria in topic selection</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <DataTable
              data={tools}
              columns={columns}
              searchPlaceholder="Search criteria..."
              searchFn={(row, q) => row.criteria.toLowerCase().includes(q) || row.description.toLowerCase().includes(q)}
            />
          )}
        </CardContent>
      </Card>

      <SelectionToolForm open={formOpen} onClose={closeForm} onSubmit={handleSubmit} defaultValues={selected} isSubmitting={submitting} />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selection criteria?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.criteria}</strong> will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}