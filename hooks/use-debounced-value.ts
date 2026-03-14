"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debouncedValue;
}
