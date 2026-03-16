import { PlanForm } from "@/components/plans/PlanForm";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <PlanForm mode="edit" planId={id} />;
}

