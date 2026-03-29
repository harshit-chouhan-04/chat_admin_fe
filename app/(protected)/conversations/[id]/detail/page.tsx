"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getConversation } from "@/lib/api";
import { formatCurrencyINR } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const ConversationDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [conv, setConv] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);

  const MESSAGES_PAGE_SIZE = 20;

  const messages = useMemo(() => {
    const raw = conv?.messages;
    if (!raw) return [] as any[];
    if (Array.isArray(raw)) return raw as any[];

    const asAny = raw as any;
    if (Array.isArray(asAny.items)) return asAny.items as any[];
    if (Array.isArray(asAny.data)) return asAny.data as any[];
    if (Array.isArray(asAny.results)) return asAny.results as any[];
    if (Array.isArray(asAny.messages)) return asAny.messages as any[];

    return [] as any[];
  }, [conv?.messages]);

  const formatMessageText = (m: any) => {
    const v = m?.content ?? m?.text ?? m?.message ?? m?.body ?? m?.value;
    if (typeof v === "string") return v;
    if (Array.isArray(v)) {
      return v
        .map((p) => {
          if (typeof p === "string") return p;
          if (p && typeof p === "object") return String(p.text ?? p.content ?? "");
          return String(p ?? "");
        })
        .join("");
    }
    if (v && typeof v === "object") {
      if (typeof (v as any).text === "string") return (v as any).text;
      if (typeof (v as any).content === "string") return (v as any).content;
    }
    if (v == null) return "";
    return String(v);
  };

  const formatMessageRole = (m: any) => {
    const rawRole = m?.role ?? m?.senderType ?? m?.sender ?? m?.authorType ?? m?.from ?? m?.type;
    const role = typeof rawRole === "string" ? rawRole : "";
    const normalized = role.trim().toLowerCase();

    // Some APIs overload `type` for message content type (e.g. TEXT/IMAGE). Avoid treating that as a sender role.
    if (normalized === "text" || normalized === "image") return "—";

    if (normalized === "user") return "USER";
    if (normalized === "assistant" || normalized === "character" || normalized === "bot") return "CHARACTER";
    return role || "—";
  };

  const getMessageSenderBadge = (
    m: any,
    labels: { user: string; character: string }
  ): { label: string; variant: "default" | "secondary" | "outline" } => {
    const explicitName = m?.senderName ?? m?.authorName ?? m?.fromName ?? m?.name;
    if (typeof explicitName === "string" && explicitName.trim()) {
      return { label: explicitName.trim(), variant: "outline" };
    }

    const role = formatMessageRole(m);
    if (role === "USER") return { label: labels.user || "User", variant: "secondary" };
    if (role === "CHARACTER") return { label: labels.character || "Character", variant: "default" };

    return { label: role || "—", variant: "outline" };
  };

  const normalizeMessageType = (m: any): string => {
    const raw = m?.messageType ?? m?.contentType ?? m?.message_type ?? m?.type;
    const v = typeof raw === "string" ? raw : "";
    const normalized = v.trim().toUpperCase();
    if (normalized === "TEXT" || normalized === "IMAGE") return normalized;
    return normalized || "";
  };

  const extractImageUrl = (m: any): string | null => {
    const candidates = [
      m?.imageUrl,
      m?.imageURL,
      m?.image_url,
      m?.url,
      m?.src,
      m?.content?.url,
      m?.content?.src,
      m?.attachmentUrl,
      m?.attachment?.url,
      m?.media?.url,
      m?.file?.url,
    ];

    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
    }

    const content = m?.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (!part || typeof part !== "object") continue;
        const u = (part as any).url ?? (part as any).src ?? (part as any).imageUrl ?? (part as any).image_url;
        if (typeof u === "string" && u.trim()) return u.trim();

        const imageUrl = (part as any).image_url;
        if (imageUrl && typeof imageUrl === "object") {
          const u2 = (imageUrl as any).url;
          if (typeof u2 === "string" && u2.trim()) return u2.trim();
        }
      }
    }

    return null;
  };

  const getMessagePresentation = (m: any):
    | { kind: "image"; url: string; caption?: string; typeLabel: string }
    | { kind: "text"; text: string; typeLabel: string } => {
    const type = normalizeMessageType(m);
    const imageUrl = extractImageUrl(m);

    if (type === "IMAGE" || (imageUrl && type !== "TEXT")) {
      const caption = formatMessageText(m);
      return {
        kind: "image",
        url: imageUrl ?? "",
        caption: caption?.trim() ? caption : undefined,
        typeLabel: "IMAGE",
      };
    }

    return {
      kind: "text",
      text: formatMessageText(m),
      typeLabel: type || "TEXT",
    };
  };

  const formatMessageTime = (m: any) => {
    const raw = m?.createdAt ?? m?.sentAt ?? m?.timestamp ?? m?.time;
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "";
    return format(d, "MMM d, yyyy HH:mm");
  };

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

  useEffect(() => {
    setMessagesPage(1);
  }, [convId]);

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

  const totalMessagePages = useMemo(() => {
    return Math.max(1, Math.ceil(messages.length / MESSAGES_PAGE_SIZE));
  }, [messages.length]);

  useEffect(() => {
    setMessagesPage((p) => Math.min(Math.max(1, p), totalMessagePages));
  }, [totalMessagePages]);

  const pagedMessages = useMemo(() => {
    const start = (messagesPage - 1) * MESSAGES_PAGE_SIZE;
    return messages.slice(start, start + MESSAGES_PAGE_SIZE);
  }, [messages, messagesPage]);

  const messageRangeLabel = useMemo(() => {
    if (messages.length === 0) return "";
    const start = (messagesPage - 1) * MESSAGES_PAGE_SIZE + 1;
    const end = Math.min(messagesPage * MESSAGES_PAGE_SIZE, messages.length);
    return `Showing ${start}-${end} of ${messages.length}`;
  }, [messages.length, messagesPage]);

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
              <DetailField label="Total Cost" value={typeof conv.totalCost === "number" ? formatCurrencyINR(conv.totalCost) : "—"} mono />
            </div>
          </DetailSection>
          <DetailSection title="Memory">
            <DetailField label="Memory Summary" value={conv.memorySummary ?? "—"} />
          </DetailSection>

          <DetailSection title={`Messages${messages.length ? ` (${messages.length})` : ""}`}>
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No messages found.</div>
            ) : (
              <div className="space-y-3">
                {messages.length > MESSAGES_PAGE_SIZE ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground font-mono">
                      Page {messagesPage} of {totalMessagePages}
                      {messageRangeLabel ? ` • ${messageRangeLabel}` : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMessagesPage((p) => Math.max(1, p - 1))}
                        disabled={messagesPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setMessagesPage((p) => Math.min(totalMessagePages, p + 1))}
                        disabled={messagesPage >= totalMessagePages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}

                {pagedMessages.map((m, idx) => {
                  const sender = getMessageSenderBadge(m, { user: userLabel, character: characterLabel });
                  const presentation = getMessagePresentation(m);
                  const time = formatMessageTime(m);
                  const key = String(m?.id ?? m?._id ?? `${messagesPage}-${idx}`);

                  return (
                    <div key={key} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={sender.variant} className="font-medium text-xs">
                            {sender.label}
                          </Badge>
                          <Badge variant="outline" className="font-medium text-xs">
                            {presentation.typeLabel}
                          </Badge>
                          {m?.tokenCount != null ? (
                            <span className="text-xs text-muted-foreground font-mono">{String(m.tokenCount)} token</span>
                          ) : null}
                        </div>
                        {time ? <span className="text-xs text-muted-foreground font-mono">{time}</span> : null}
                      </div>
                      {presentation.kind === "image" ? (
                        <div className="mt-2 space-y-2">
                          {presentation.url ? (
                            <a
                              href={presentation.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block"
                            >
                              <Image
                                src={presentation.url}
                                alt="Message image"
                                width={900}
                                height={600}
                                unoptimized
                                className="max-w-full h-auto rounded-md border object-contain"
                                sizes="(max-width: 768px) 100vw, 900px"
                              />
                            </a>
                          ) : (
                            <div className="text-sm text-muted-foreground">Image not available.</div>
                          )}
                          {presentation.caption ? (
                            <div className="text-sm whitespace-pre-wrap break-words">{presentation.caption}</div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mt-2 text-sm whitespace-pre-wrap break-words">{presentation.text || "—"}</div>
                      )}
                    </div>
                  );
                })}

                {messages.length > MESSAGES_PAGE_SIZE ? (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMessagesPage((p) => Math.max(1, p - 1))}
                      disabled={messagesPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMessagesPage((p) => Math.min(totalMessagePages, p + 1))}
                      disabled={messagesPage >= totalMessagePages}
                    >
                      Next
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
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
