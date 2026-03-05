"use client";

import { useState, useEffect } from "react";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { SystemCategory } from "@/types/new/client";

type FormState = { system_category: string; description: string };
const empty: FormState = { system_category: "", description: "" };

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

  useEffect(() => {
    if (open) {
      setErrors({});
      setForm({
        system_category: defaultValues?.system_category ?? "",
        description: defaultValues?.description ?? "",
      });
    }
  }, [open, defaultValues]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.system_category.trim()) e.system_category = "Required";
    if (!form.description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ system_category: form.system_category.trim(), description: form.description.trim() });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-md px-1 lg:px-6 ">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit" : "New"} System Category</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update category details." : "Add a new system category for classifying interventions."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-6">
          <div className="space-y-1.5">
            <Label>Category Name <span className="text-destructive">*</span></Label>
            <Input value={form.system_category} onChange={set("system_category")} placeholder="e.g. Maternal & Child Health" />
            {errors.system_category && <p className="text-xs text-destructive">{errors.system_category}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea value={form.description} onChange={set("description")} rows={4} placeholder="Describe what interventions fall under this category..." />
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