"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, createPlan, getPlan, updatePlan } from "@/lib/api";
import { toast } from "sonner";
import { BillingCycle, PlanType } from "@/lib/utils";

type PlanFormMode = "add" | "edit";

export function PlanForm({ mode, planId }: { mode: PlanFormMode; planId?: string }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [existing, setExisting] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<ApiError | Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    if (!planId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const plan = await getPlan(planId, { signal: controller.signal });
        setExisting(plan ?? null);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        setExisting(null);
        setLoadError(err as any);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isEdit, planId]);

  const initialForm = useMemo(
    () => ({
      name: "",
      price: "",
      billingCycle: BillingCycle.ONE_TIME,
      type: PlanType.NORMAl,
      credits: "",
      messageLimit: "",
      description: "",
      isActive: true,
      isPopular: false,
    }),
    []
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isEdit) return;
    if (!existing) return;
    const rawIsActive = (existing as any)?.isActive;
    const resolvedIsActive =
      typeof rawIsActive === "boolean"
        ? rawIsActive
        : typeof rawIsActive === "number"
          ? rawIsActive === 1
          : typeof rawIsActive === "string"
            ? rawIsActive.toLowerCase() === "true" || rawIsActive === "1"
            : Boolean(rawIsActive ?? true);
    setForm({
      name: existing?.name ?? "",
      price: existing?.price != null ? String(existing.price) : "",
      billingCycle: existing?.billingCycle ?? BillingCycle.ONE_TIME,
      type: existing?.type ?? PlanType.NORMAl,
      credits: existing?.credits != null ? String(existing.credits) : "",
      messageLimit: existing?.messageLimit != null ? String(existing.messageLimit) : "",
      description: existing?.description ?? "",
      isPopular: existing?.isPopular ?? false,
      isActive: resolvedIsActive,
    });
  }, [isEdit, existing]);

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const credits = Number(form.credits);
    const messageLimit = Number(form.messageLimit);

    if (!Number.isFinite(price) || !Number.isFinite(credits) || !Number.isFinite(messageLimit)) {
      toast.error("Please enter valid numbers");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEdit) {
        if (!planId) {
          toast.error("Missing plan id");
          return;
        }
        await updatePlan(planId, {
          name: form.name,
          price,
          billingCycle: form.billingCycle,
          type: form.type,
          credits,
          messageLimit,
          description: form.description,
          isActive: form.isActive,
          isPopular: form.isPopular,
        });
        toast.success("Plan updated");
      } else {
        await createPlan({
          name: form.name,
          price,
          billingCycle: form.billingCycle,
          type: form.type,
          credits,
          messageLimit,
          description: form.description,
          isActive: form.isActive,
          isPopular: form.isPopular,
        });
        toast.success("Plan created");
      }
      router.push("/plans");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNotFound =
    isEdit &&
    !isLoading &&
    ((loadError instanceof ApiError && loadError.status === 404) || (!loadError && !existing));

  if (isEdit && isLoading) {
    return <div className="text-muted-foreground">Loading plan…</div>;
  }

  if (isEdit && loadError && !isNotFound) {
    return <div className="text-muted-foreground">Failed to load plan</div>;
  }

  if (isEdit && isNotFound) {
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
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
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
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BillingCycle.ONE_TIME}>One Time</SelectItem>
                    <SelectItem value={BillingCycle.MONTHLY}>Monthly</SelectItem>
                    <SelectItem value={BillingCycle.YEARLY}>Yearly</SelectItem>
                    <SelectItem value={BillingCycle.QUARTERLY}>Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select value={form.type} onValueChange={(v) => update("type", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PlanType.NORMAl}>Normal</SelectItem>
                    <SelectItem value={PlanType.TOP_UP}>Top Up</SelectItem>
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
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messageLimit">Message Limit</Label>
                <Input
                  id="messageLimit"
                  type="number"
                  value={form.messageLimit}
                  min={0}
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
              <Label htmlFor="isActive">Popular</Label>
              <Switch
                id="isActive"
                checked={form.isPopular}
                onCheckedChange={(v) => update("isPopular", v)}
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
          <Button type="button" variant="outline" onClick={() => router.push("/plans")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "Update Plan" : "Create Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
