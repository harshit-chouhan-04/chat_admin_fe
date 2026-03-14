import { PlanForm } from "@/components/plans/PlanForm";

export default function EditPlanPage({ params }: { params: { id: string } }) {
	return <PlanForm mode="edit" planId={params.id} />;
}

