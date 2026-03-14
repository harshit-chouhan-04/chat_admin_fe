"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ListingQuery = {
  page: number;
  search: string;
  sort: string;
  [key: string]: string | number;
};

function getString(sp: URLSearchParams, key: string, fallback = "") {
  const v = sp.get(key);
  return v == null ? fallback : v;
}

function getNumber(sp: URLSearchParams, key: string, fallback: number) {
  const raw = sp.get(key);
  const n = raw == null ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function useListingQuery(defaults?: Partial<ListingQuery>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    const page = getNumber(sp, "page", defaults?.page ?? 1);
    const search = getString(sp, "search", (defaults?.search as string) ?? "");
    const sort = getString(sp, "sort", (defaults?.sort as string) ?? "");

    const extra: Record<string, string> = {};
    for (const [k, v] of sp.entries()) {
      if (k === "page" || k === "search" || k === "sort") continue;
      extra[k] = v;
    }

    return { page, search, sort, ...extra } as ListingQuery;
  }, [searchParams, defaults?.page, defaults?.search, defaults?.sort]);

  const setQuery = useCallback(
    (updates: Record<string, string | number | null | undefined>, opts?: { resetPage?: boolean }) => {
      const sp = new URLSearchParams(searchParams?.toString() ?? "");

      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") {
          sp.delete(k);
        } else {
          sp.set(k, String(v));
        }
      }

      if (opts?.resetPage) {
        sp.set("page", "1");
      }

      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { query, setQuery };
}
