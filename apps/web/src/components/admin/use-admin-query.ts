"use client";

import { useSearchParams } from "next/navigation";
import { presetToRange, type PeriodPreset, statsQueryString } from "@/lib/admin/period";

export function useStatsSearchParams(opts?: { compare?: boolean }): string {
  const searchParams = useSearchParams();
  let qs = statsQueryString(searchParams);
  const p = new URLSearchParams(qs);
  if (!searchParams.get("from") || !searchParams.get("to")) {
    const preset = (searchParams.get("preset") as PeriodPreset) || "7d";
    const range = presetToRange(preset);
    p.set("from", range.from);
    p.set("to", range.to);
  }
  if (opts?.compare) p.set("compare", "1");
  qs = p.toString();
  return qs;
}
