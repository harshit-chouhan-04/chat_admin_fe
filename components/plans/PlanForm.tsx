"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPlanById } from "@/lib/mock-data";
import { toast } from "sonner";

type PlanFormMode = "add" | "edit";

export function PlanForm({ mode, planId }: { mode: PlanFormMode; planId?: string }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const existing = useMemo(() => {
    if (!isEdit) return null;
    if (!planId) return null;
    return getPlanById(planId) ?? null;
  }, [isEdit, planId]);

  const [form, setForm] = useState({
    name: existing?.name || "",
    price: existing?.price?.toString() || "",
    billingCycle: existing?.billingCycle || "monthly",
    credits: existing?.credits?.toString() || "",
    messageLimit: existing?.messageLimit?.toString() || "",
    description: existing?.description || "",
    isActive: existing?.isActive ?? true,
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? "Plan updated" : "Plan created");
    router.push("/plans");
  };

  if (isEdit && !existing) {
    return <div className="text-muted-foreground">Plan not found</div>;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? `Edit ${existing?.name || "Plan"}` : "Add Plan"}
        backUrl="/plans"
      />
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select value={form.billingCycle} onValueChange={(v) => update("billingCycle", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={form.credits}
                  onChange={(e) => update("credits", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageLimit">Message Limit</Label>
                <Input
                  id="messageLimit"
                  type="number"
                  value={form.messageLimit}
                  onChange={(e) => update("messageLimit", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => update("isActive", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/plans")}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Update Plan" : "Create Plan"}</Button>
        </div>
      </form>
    </div>
  );
}
