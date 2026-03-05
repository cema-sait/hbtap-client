"use client";

import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Layers, RefreshCw, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { SystemCategory } from "@/types/new/client";
import { createSystemCategory, deleteSystemCategory, getSystemCategories, updateSystemCategory } from "@/app/api/new/client";
import { Column, DataTable } from "../cc/table";
import { SystemCategoryForm } from "./form";

export default function SystemCategoriesPage() {
  const [categories, setCategories] = useState<SystemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<SystemCategory | undefined>();
  const [toDelete, setToDelete] = useState<SystemCategory | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setCategories(await getSystemCategories());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (cat: SystemCategory) => { setSelected(cat); setFormOpen(true); };
  const openCreate = () => { setSelected(undefined); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setSelected(undefined); };

  const handleSubmit = async (values: Partial<SystemCategory>) => {
    setSubmitting(true);
    const result = selected?.id
      ? await updateSystemCategory(selected.id, values)
      : await createSystemCategory(values);
    if (result) {
      toast.success(selected?.id ? "Category updated." : "Category created.");
      closeForm();
      await load();
    } else {
      toast.error("Something went wrong.");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const ok = await deleteSystemCategory(toDelete.id);
    if (ok) {
      toast.success("Category deleted.");
      setCategories((prev) => prev.filter((c) => c.id !== toDelete.id));
    } else {
      toast.error("Failed to delete.");
    }
    setToDelete(null);
  };

  const columns: Column<SystemCategory>[] = [
    {
      header: "Category",
      cell: (row) => <span className="font-medium">{row.system_category}</span>,
    },
    {
      header: "Description",
      cell: (row) => <span className="text-sm text-muted-foreground line-clamp-2 max-w-sm">{row.description}</span>,
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
          <div className="bg-violet-100 p-2 rounded-lg">
            <Layers className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">System Categories</h1>
            <p className="text-sm text-muted-foreground">Classify interventions into health system areas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Category</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Categories</CardTitle>
          <CardDescription>{categories.length} categories configured</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <DataTable
              data={categories}
              columns={columns}
              searchPlaceholder="Search categories..."
              searchFn={(row, q) => row.system_category.toLowerCase().includes(q) || row.description.toLowerCase().includes(q)}
            />
          )}
        </CardContent>
      </Card>

      <SystemCategoryForm open={formOpen} onClose={closeForm} onSubmit={handleSubmit} defaultValues={selected} isSubmitting={submitting} />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{toDelete?.system_category}</strong> will be permanently removed. Linked interventions may be affected.
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