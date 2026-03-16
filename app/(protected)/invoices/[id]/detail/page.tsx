"use client";

import { use, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { getInvoice } from "@/lib/api";
import { formatCurrencyINR } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const InvoiceDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [inv, setInv] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoading(true);

    getInvoice(String(id), { signal: ac.signal })
      .then((i) => {
        if (ac.signal.aborted) return;
        setInv(i ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setInv(null);
        toast.error(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const invId = useMemo(() => String(inv?.id ?? inv?._id ?? id ?? ""), [inv?.id, inv?._id, id]);

  const userLabel = useMemo(() => {
    const u = inv?.user;
    if (!u) return "—";
    if (typeof u === "string") return u;
    return u.name ?? u.email ?? String(u.id ?? u._id ?? "—");
  }, [inv?.user]);

  const planLabel = useMemo(() => {
    const p = inv?.plan;
    if (!p) return "—";
    if (typeof p === "string") return p;
    return p.name ?? String(p.id ?? p._id ?? "—");
  }, [inv?.plan]);

  if (loading && !inv) return <div className="text-muted-foreground">Loading...</div>;
  if (!inv) return <div className="text-muted-foreground">Invoice not found</div>;

  return (
    <div>
      <PageHeader title={inv.invoiceId ?? invId} backUrl="/invoices" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Invoice Info">
            <DetailField label="Invoice ID" value={inv.invoiceId ?? invId} mono />
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Amount" value={typeof inv.amount === "number" ? formatCurrencyINR(inv.amount) : "—"} mono />
              <DetailField label="Currency" value={inv.currency ?? "—"} mono />
            </div>
          </DetailSection>
          <DetailSection title="User">
            <DetailField label="User" value={userLabel} />
          </DetailSection>
          <DetailSection title="Plan">
            <DetailField label="Plan" value={planLabel} />
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Payment">
            <DetailField label="Provider" value={inv.paymentProvider ?? "—"} />
            <DetailField label="Status" value={<StatusBadge status={inv.status as any} />} />
            <DetailField
              label="Paid At"
              value={inv.paidAt ? format(new Date(inv.paidAt), "MMM d, yyyy HH:mm") : "—"}
              mono
            />
          </DetailSection>
          <DetailSection title="Timestamps">
            <DetailField
              label="Created"
              value={inv.createdAt ? format(new Date(inv.createdAt), "MMM d, yyyy HH:mm") : "—"}
              mono
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
