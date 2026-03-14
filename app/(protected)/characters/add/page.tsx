"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import CharacterForm from "@/components/characters/CharacterForm";
import { toast } from "sonner";

const CharacterAddPage = () => {
  const router = useRouter();

  const handleSubmit = () => {
    toast.success("Character created");
    router.push("/characters");
  };

  return (
    <div>
      <PageHeader title="Add Character" backUrl="/characters" />
      <CharacterForm
        submitText="Create Character"
        onSubmit={() => handleSubmit()}
        onCancel={() => router.push("/characters")}
      />
    </div>
  );
};

export default CharacterAddPage;
