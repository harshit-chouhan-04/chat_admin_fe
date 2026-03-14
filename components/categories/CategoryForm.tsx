'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export type CategoryFormValues = {
  name: string;
  slug: string;
  isNsfw: boolean;
  isActive: boolean;
};

type Props = {
  initialValues?: Partial<CategoryFormValues>;
  submitText: string;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
};

const defaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  isNsfw: false,
  isActive: true,
};

export default function CategoryForm({ initialValues, submitText, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CategoryFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    setForm({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues?.name, initialValues?.slug, initialValues?.isNsfw, initialValues?.isActive]);

  const update = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Category Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={e => update("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={e => update("slug", e.target.value)} required />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isNsfw">NSFW</Label>
            <Switch id="isNsfw" checked={form.isNsfw} onCheckedChange={v => update("isNsfw", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch id="isActive" checked={form.isActive} onCheckedChange={v => update("isActive", v)} />
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{submitText}</Button>
      </div>
    </form>
  );
}
