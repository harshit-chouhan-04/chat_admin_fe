import { Suspense } from "react";
import InvoicesListClient from "./InvoicesListClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
      <InvoicesListClient />
    </Suspense>
  );
}
