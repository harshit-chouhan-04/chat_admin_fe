"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import CharacterForm, { type CharacterFormValues } from "@/components/characters/CharacterForm";
import { getCharacterById } from "@/lib/mock-data";
import { toast } from "sonner";

export default function CharacterEditPage() {
	const router = useRouter();
	const params = useParams();
	const idParam = params?.id;
	const id = Array.isArray(idParam) ? idParam[0] : idParam;

	const existing = useMemo(() => (id ? getCharacterById(id) : null), [id]);

	const handleSubmit = (_values: CharacterFormValues) => {
		toast.success("Character updated");
		if (id) router.push(`/characters/${id}/detail`);
		else router.push("/characters");
	};

	if (!id) {
		return (
			<div>
				<PageHeader title="Edit Character" backUrl="/characters" />
				<div className="text-sm text-muted-foreground">Missing character id.</div>
			</div>
		);
	}

	if (!existing) {
		return (
			<div>
				<PageHeader title="Edit Character" backUrl="/characters" />
				<div className="text-sm text-muted-foreground">Character not found.</div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader title={`Edit ${existing.name}`} backUrl={`/characters/${id}/detail`} />
			<CharacterForm
				initialValues={{
					name: existing.name,
					slug: existing.slug,
					age: existing.age?.toString() || "",
					gender: existing.gender,
					sexuality: existing.sexuality,
					description: existing.description,
					personalityPrompt: existing.personalityPrompt,
					systemPrompt: existing.systemPrompt,
					scenario: existing.scenario,
					greetingMessage: existing.greetingMessage,
					conversationStyle: existing.conversationStyle,
					voiceModel: existing.voiceModel,
					visibility: existing.visibility,
					isNsfw: existing.isNsfw,
					isActive: existing.isActive,
				}}
				submitText="Update Character"
				onSubmit={handleSubmit}
				onCancel={() => router.push(`/characters`)}
			/>
		</div>
	);
}
