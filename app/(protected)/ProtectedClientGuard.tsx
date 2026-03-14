"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

export default function ProtectedClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${next}`);
      return;
    }
    setReady(true);
  }, [pathname, router]);

  useEffect(() => {
    const onUnauthorized = () => {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${next}`);
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [pathname, router]);

  if (!ready) return null;
  return children;
}
