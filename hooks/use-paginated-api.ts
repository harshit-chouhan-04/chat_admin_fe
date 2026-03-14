"use client";

import { useEffect, useMemo, useState } from "react";
import type { ListParams, PaginatedResult } from "@/lib/api";

type Fetcher<T> = (
  params: ListParams,
  init?: { signal?: AbortSignal }
) => Promise<PaginatedResult<T>>;

export function usePaginatedApi<T>(fetcher: Fetcher<T>, params: ListParams) {
  const [data, setData] = useState<PaginatedResult<T>>({
    items: [],
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: undefined,
    totalPages: undefined,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    fetcher(params, { signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        setData(res);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (ac.signal.aborted) return;
        setLoading(false);
      });

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, paramsKey]);

  return { data, loading, error };
}
