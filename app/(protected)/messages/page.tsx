import { Suspense } from "react";
import MessagesListClient from "./MessagesListClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <MessagesListClient />
    </Suspense>
  );
}
