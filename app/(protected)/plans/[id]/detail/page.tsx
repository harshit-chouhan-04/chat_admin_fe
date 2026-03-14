import { PageHeader } from "@/components/PageHeader";
import { DetailSection, DetailField } from "@/components/DetailSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getPlanById } from "@/lib/mock-data";
import Link from "next/link";

const PlanDetail = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const plan = getPlanById(id || "");

  if (!plan) return <div className="text-muted-foreground">Plan not found</div>;

  return (
    <div>
      <PageHeader
        title={plan.name}
        backUrl="/plans"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={`/plans/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />Edit
            </Link>
          </Button>
        }
      />
      <div className="max-w-2xl space-y-6">
        <DetailSection title="Plan Info">
          <DetailField label="Name" value={plan.name} />
          <DetailField label="Description" value={plan.description} />
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Price" value={`$${plan.price.toFixed(2)}`} mono />
            <DetailField label="Billing Cycle" value={plan.billingCycle} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Credits" value={plan.credits.toLocaleString()} mono />
            <DetailField label="Message Limit" value={plan.messageLimit.toLocaleString()} mono />
          </div>
          <DetailField label="Status" value={<StatusBadge status={plan.isActive ? "active" : "inactive"} />} />
        </DetailSection>
      </div>
    </div>
  );
};

export default PlanDetail;
