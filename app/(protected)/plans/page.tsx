import { Suspense } from "react";
import PlansListClient from "./PlansListClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <PlansListClient />
    </Suspense>
  );
}
