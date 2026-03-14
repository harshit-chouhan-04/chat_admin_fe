import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { mockConversations, getUserById, getCharacterById } from "@/lib/mock-data";
import { format } from "date-fns";

const ConversationDetail = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const conv = mockConversations.find(c => c.id === id);

  if (!conv) return <div className="text-muted-foreground">Conversation not found</div>;

  const user = getUserById(conv.user);
  const char = getCharacterById(conv.character);

  return (
    <div>
      <PageHeader title={conv.title} backUrl="/conversations" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailSection title="Conversation Info">
            <DetailField label="Title" value={conv.title} />
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="User" value={user?.name || conv.user} />
              <DetailField label="Character" value={char?.name || conv.character} />
            </div>
            <DetailField label="Status" value={<StatusBadge status={conv.isArchived ? "archived" : "active"} />} />
          </DetailSection>
          <DetailSection title="Metrics">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Total Messages" value={conv.messageCount.toString()} mono />
              <DetailField label="User Messages" value={conv.userMessageCount.toString()} mono />
              <DetailField label="Intimacy Score" value={conv.intimacyScore.toString()} mono />
              <DetailField label="Intimacy Stage" value={conv.intimacyStage} />
              <DetailField label="Total Tokens" value={conv.totalTokenCount.toLocaleString()} mono />
              <DetailField label="Total Cost" value={`$${conv.totalCost.toFixed(2)}`} mono />
            </div>
          </DetailSection>
          <DetailSection title="Memory">
            <DetailField label="Memory Summary" value={conv.memorySummary} />
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Persona">
            <DetailField label="Name" value={conv.personaName} />
            <DetailField label="Age" value={conv.personaAge.toString()} mono />
            <DetailField label="Gender" value={conv.personaGender} />
          </DetailSection>
          <DetailSection title="Timestamps">
            <DetailField label="Created" value={format(new Date(conv.createdAt), "MMM d, yyyy HH:mm")} mono />
            <DetailField label="Last Message" value={format(new Date(conv.lastMessageAt), "MMM d, yyyy HH:mm")} mono />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
