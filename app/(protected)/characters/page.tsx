import { Suspense } from "react";
import CharactersListClient from "./CharactersListClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <CharactersListClient />
    </Suspense>
  );
}
