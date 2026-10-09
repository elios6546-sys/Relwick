"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { destroyTracker, initTracker, trackPageView } from "@/lib/tracker";

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    initTracker();
    return () => destroyTracker();
  }, []);

  useEffect(() => {
    trackPageView(pathname, document.title);
  }, [pathname]);

  return children;
}
