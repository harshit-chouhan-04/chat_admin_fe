import { Suspense } from "react";
import UsersListClient from "./UsersListClient";

export default function UsersPage() {
  return (
    <Suspense>
      <UsersListClient />
    </Suspense>
  );
}
