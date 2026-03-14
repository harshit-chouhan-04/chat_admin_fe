import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Star } from "lucide-react";
import { getCharacterById, getCategoryById, getUserById } from "@/lib/mock-data";
import Link from "next/link";

const CharacterDetail = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const char = getCharacterById(id || "");

  if (!char) return <div className="text-muted-foreground">Character not found</div>;

  const creator = getUserById(char.creator);

  return (
    <div>
      <PageHeader
        title={char.name}
        description={`/${char.slug}`}
        backUrl="/characters"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/characters/${id}/edit`}>
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
                <AvatarFallback className="bg-secondary text-lg">{char.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{char.name}</p>
                <p className="text-sm text-muted-foreground">{char.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <DetailField label="Age" value={char.age.toString()} mono />
              <DetailField label="Gender" value={char.gender} />
              <DetailField label="Sexuality" value={char.sexuality} />
            </div>
          </DetailSection>
          <DetailSection title="AI Configuration">
            <DetailField label="Personality Prompt" value={char.personalityPrompt} />
            <DetailField label="System Prompt" value={char.systemPrompt} />
            <DetailField label="Scenario" value={char.scenario} />
            <DetailField label="Greeting Message" value={char.greetingMessage} />
            <DetailField label="Conversation Style" value={char.conversationStyle} />
            <DetailField label="Voice Model" value={char.voiceModel} mono />
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Metadata">
            <DetailField label="Categories" value={char.categories.map(id => getCategoryById(id)?.name).filter(Boolean).join(", ")} />
            <DetailField label="Visibility" value={<StatusBadge status={char.visibility as any} />} />
            <DetailField label="NSFW" value={char.isNsfw ? <StatusBadge status="nsfw" /> : "No"} />
            <DetailField label="Status" value={<StatusBadge status={char.isActive ? "active" : "inactive"} />} />
            <DetailField label="Creator" value={creator?.name || char.creator} />
          </DetailSection>
          <DetailSection title="Rating">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-chart-amber text-chart-amber" />
              <span className="text-xl font-semibold font-mono">{char.rating}</span>
              <span className="text-sm text-muted-foreground">({char.ratingCount} ratings)</span>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetail;
