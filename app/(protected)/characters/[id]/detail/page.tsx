"use client";

import { use, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Star } from "lucide-react";
import { getCharacter } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";

const CharacterDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [char, setChar] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setLoading(true);

    getCharacter(String(id), { signal: ac.signal })
      .then((c) => {
        if (ac.signal.aborted) return;
        setChar(c ?? null);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setChar(null);
        toast.error(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
  }, [id]);

  const charId = useMemo(() => String(char?.id ?? char?._id ?? id ?? ""), [char?.id, char?._id, id]);
  const categoriesLabel = useMemo(() => {
    const categories = char?.categories ?? [];
    if (!Array.isArray(categories) || categories.length === 0) return "—";
    return categories
      .map((c: any) => {
        if (!c) return "";
        if (typeof c === "string") return c;
        return c.name ?? c.slug ?? String(c.id ?? c._id ?? "");
      })
      .filter(Boolean)
      .join(", ") || "—";
  }, [char?.categories]);

  const creatorLabel = useMemo(() => {
    const creator = char?.creator;
    if (!creator) return "—";
    if (typeof creator === "string") return creator;
    return creator.name ?? creator.email ?? String(creator.id ?? creator._id ?? "—");
  }, [char?.creator]);

  if (loading && !char) return <div className="text-muted-foreground">Loading...</div>;
  if (!char) return <div className="text-muted-foreground">Character not found</div>;

  return (
    <div>
      <PageHeader
        title={char.name ?? charId}
        description={char.slug ? `/${char.slug}` : undefined}
        backUrl="/characters"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/characters/${charId}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Link>
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Basic Info">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={char.avatarUrl ?? ""} alt={char.name ?? charId} className="object-cover" />
                <AvatarFallback className="bg-secondary text-lg">{String(char.name ?? "?")[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{char.name ?? charId}</p>
                <p className="text-sm text-muted-foreground">{char.description ?? "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <DetailField label="Age" value={char.age != null ? String(char.age) : "—"} mono />
              <DetailField label="Gender" value={char.gender ?? "—"} />
              <DetailField label="Sexuality" value={char.sexuality ?? "—"} />
            </div>
          </DetailSection>
          <DetailSection title="AI Configuration">
            <DetailField label="Personality Prompt" value={char.personalityPrompt ?? "—"} />
            <DetailField label="System Prompt" value={char.systemPrompt ?? "—"} />
            <DetailField label="Scenario" value={char.scenario ?? "—"} />
            <DetailField label="Greeting Message" value={char.greetingMessage ?? "—"} />
            <DetailField label="Conversation Style" value={char.conversationStyle ?? "—"} />
            <DetailField label="Voice Model" value={char.voiceModel ?? "—"} mono />
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Metadata">
            <DetailField label="Categories" value={categoriesLabel} />
            <DetailField label="Visibility" value={<StatusBadge status={(char.visibility ?? "public") as any} />} />
            <DetailField label="NSFW" value={char.isNsfw ? <StatusBadge status="nsfw" /> : "No"} />
            <DetailField label="Status" value={<StatusBadge status={char.isActive ? "active" : "inactive"} />} />
            <DetailField label="Creator" value={creatorLabel} />
          </DetailSection>
          <DetailSection title="Rating">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-chart-amber text-chart-amber" />
              <span className="text-xl font-semibold font-mono">{char.rating ?? "—"}</span>
              <span className="text-sm text-muted-foreground">({char.ratingCount ?? 0} ratings)</span>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
