import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div style={{ padding: 24 }}>Chargement…</div>}>{children}</Suspense>;
}
