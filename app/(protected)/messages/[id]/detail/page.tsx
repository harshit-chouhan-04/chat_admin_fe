import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { mockMessages } from "@/lib/mock-data";
import { format } from "date-fns";

const MessageDetail = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const msg = mockMessages.find((m) => m.id === id);

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
            <DetailField label="Content" value={msg.content} />
          </DetailSection>
          <DetailSection title="AI Metrics">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Token Count" value={msg.tokenCount.toString()} mono />
              <DetailField label="Cost" value={`$${msg.cost.toFixed(3)}`} mono />
            </div>
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Moderation">
            <DetailField label="Flagged" value={msg.isFlagged ? <StatusBadge status="flagged" /> : "No"} />
          </DetailSection>
          <DetailSection title="Metadata">
            <DetailField label="Conversation" value={msg.conversation} mono />
            <DetailField label="Created" value={format(new Date(msg.createdAt), "MMM d, yyyy HH:mm")} mono />
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
