"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { getMessage } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const MessageDetail = ({ params }: { params: { id: string } }) => {
  const id = params?.id;
  const [msg, setMsg] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoading(true);

    getMessage(String(id), { signal: ac.signal })
      .then((m) => {
        if (ac.signal.aborted) return;
        setMsg(m ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setMsg(null);
        toast.error(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const msgId = useMemo(() => String(msg?.id ?? msg?._id ?? id ?? ""), [msg?.id, msg?._id, id]);

  if (loading && !msg) return <div className="text-muted-foreground">Loading...</div>;
  if (!msg) return <div className="text-muted-foreground">Message not found</div>;

  return (
    <div>
      <PageHeader title="Message Detail" backUrl="/messages" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Message">
            <DetailField
              label="Sender Type"
              value={<StatusBadge status={msg.senderType === "user" ? "active" : "public"} />}
            />
            <DetailField label="Content" value={msg.content ?? "—"} />
          </DetailSection>
          <DetailSection title="AI Metrics">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Token Count" value={msg.tokenCount != null ? String(msg.tokenCount) : "—"} mono />
              <DetailField label="Cost" value={typeof msg.cost === "number" ? `$${msg.cost.toFixed(3)}` : "—"} mono />
            </div>
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Moderation">
            <DetailField label="Flagged" value={msg.isFlagged ? <StatusBadge status="flagged" /> : "No"} />
          </DetailSection>
          <DetailSection title="Metadata">
            <DetailField label="Conversation" value={String(msg.conversation ?? "—")} mono />
            <DetailField label="Created" value={msg.createdAt ? format(new Date(msg.createdAt), "MMM d, yyyy HH:mm") : "—"} mono />
            <DetailField label="ID" value={msgId} mono />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
