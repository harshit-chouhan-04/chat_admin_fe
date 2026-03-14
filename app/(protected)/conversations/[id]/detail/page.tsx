"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { getConversation } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

const ConversationDetail = ({ params }: { params: { id: string } }) => {
  const id = params?.id;
  const [conv, setConv] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoading(true);

    getConversation(String(id), { signal: ac.signal })
      .then((c) => {
        if (ac.signal.aborted) return;
        setConv(c ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setConv(null);
        toast.error(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const convId = useMemo(() => String(conv?.id ?? conv?._id ?? id ?? ""), [conv?.id, conv?._id, id]);

  const userLabel = useMemo(() => {
    const u = conv?.user;
    if (!u) return "—";
    if (typeof u === "string") return u;
    return u.name ?? u.email ?? String(u.id ?? u._id ?? "—");
  }, [conv?.user]);

  const characterLabel = useMemo(() => {
    const c = conv?.character;
    if (!c) return "—";
    if (typeof c === "string") return c;
    return c.name ?? c.slug ?? String(c.id ?? c._id ?? "—");
  }, [conv?.character]);

  if (loading && !conv) return <div className="text-muted-foreground">Loading...</div>;
  if (!conv) return <div className="text-muted-foreground">Conversation not found</div>;

  return (
    <div>
      <PageHeader title={conv.title ?? convId} backUrl="/conversations" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Conversation Info">
            <DetailField label="Title" value={conv.title ?? "—"} />
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="User" value={userLabel} />
              <DetailField label="Character" value={characterLabel} />
            </div>
            <DetailField label="Status" value={<StatusBadge status={conv.isArchived ? "archived" : "active"} />} />
          </DetailSection>
          <DetailSection title="Metrics">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Total Messages" value={conv.messageCount != null ? String(conv.messageCount) : "—"} mono />
              <DetailField label="User Messages" value={conv.userMessageCount != null ? String(conv.userMessageCount) : "—"} mono />
              <DetailField label="Intimacy Score" value={conv.intimacyScore != null ? String(conv.intimacyScore) : "—"} mono />
              <DetailField label="Intimacy Stage" value={conv.intimacyStage ?? "—"} />
              <DetailField label="Total Tokens" value={typeof conv.totalTokenCount === "number" ? conv.totalTokenCount.toLocaleString() : "—"} mono />
              <DetailField label="Total Cost" value={typeof conv.totalCost === "number" ? `$${conv.totalCost.toFixed(2)}` : "—"} mono />
            </div>
          </DetailSection>
          <DetailSection title="Memory">
            <DetailField label="Memory Summary" value={conv.memorySummary ?? "—"} />
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Persona">
            <DetailField label="Name" value={conv.personaName ?? "—"} />
            <DetailField label="Age" value={conv.personaAge != null ? String(conv.personaAge) : "—"} mono />
            <DetailField label="Gender" value={conv.personaGender ?? "—"} />
          </DetailSection>
          <DetailSection title="Timestamps">
            <DetailField
              label="Created"
              value={conv.createdAt ? format(new Date(conv.createdAt), "MMM d, yyyy HH:mm") : "—"}
              mono
            />
            <DetailField
              label="Last Message"
              value={conv.lastMessageAt ? format(new Date(conv.lastMessageAt), "MMM d, yyyy HH:mm") : "—"}
              mono
            />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
