import { Suspense } from "react";
import ConversationsListClient from "./ConversationsListClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <ConversationsListClient />
    </Suspense>
  );
}
