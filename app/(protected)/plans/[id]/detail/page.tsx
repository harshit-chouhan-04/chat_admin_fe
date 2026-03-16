"use client";

import { use, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getPlan } from "@/lib/api";
import { formatCurrencyINR } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const PlanDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoading(true);

    getPlan(String(id), { signal: ac.signal })
      .then((p) => {
        if (ac.signal.aborted) return;
        setPlan(p ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setPlan(null);
        toast.error(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const planId = useMemo(() => String(plan?.id ?? plan?._id ?? id ?? ""), [plan?.id, plan?._id, id]);

  if (loading && !plan) return <div className="text-muted-foreground">Loading...</div>;
  if (!plan) return <div className="text-muted-foreground">Plan not found</div>;

  return (
    <div>
      <PageHeader
        title={plan.name ?? planId}
        backUrl="/plans"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/plans/${planId}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Link>
          </Button>
        }
      />
      <div className="max-w-2xl space-y-6">
        <DetailSection title="Plan Info">
          <DetailField label="Name" value={plan.name ?? "—"} />
          <DetailField label="Description" value={plan.description ?? "—"} />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Price" value={typeof plan.price === "number" ? formatCurrencyINR(plan.price) : "—"} mono />
            <DetailField label="Billing Cycle" value={plan.billingCycle ?? "—"} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Credits" value={typeof plan.credits === "number" ? plan.credits.toLocaleString() : "—"} mono />
            <DetailField label="Message Limit" value={typeof plan.messageLimit === "number" ? plan.messageLimit.toLocaleString() : "—"} mono />
          </div>
          <DetailField label="Status" value={<StatusBadge status={plan.isActive ? "active" : "inactive"} />} />
        </DetailSection>
      </div>
    </div>
  );
};

export default PlanDetail;
